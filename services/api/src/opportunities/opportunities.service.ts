import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db } from '../db';
import { opportunities } from '../db/schema';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { eq, or, and } from 'drizzle-orm';
import { z } from 'zod';

const CHUNKS_TO_FETCH = 10;

// Zod Schema to strictly validate the hallucinatory outputs from Gemini
const GeminiOpportunitySchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  eligibilityCriteria: z.string().optional().nullable(),
  fundingType: z.string().optional().nullable(),
  targetRegion: z.string().optional().nullable(),
  sourceUrl: z.string().url(),
  applyUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable()
});

const GeminiResponseSchema = z.array(GeminiOpportunitySchema);

// Create/Update DTO schema
const OpportunityDtoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  type: z.string().optional().default('scholarship'),
  eligibilityCriteria: z.string().optional().nullable(),
  fundingType: z.string().optional().nullable(),
  targetRegion: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  applyUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isRemote: z.boolean().optional().default(true),
  status: z.string().optional().default('pending'),
});

export type CreateOpportunityDto = z.infer<typeof OpportunityDtoSchema>;

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async findAll(limit: number = 20, offset: number = 0, status?: string, category?: string) {
    // Default to active status for public requests
    const statusFilter = status || 'active';
    
    if (category) {
      return db.select()
        .from(opportunities)
        .where(and(eq(opportunities.status, statusFilter), eq(opportunities.category, category)))
        .limit(Number(limit) || 20)
        .offset(Number(offset) || 0)
        .orderBy(opportunities.createdAt)
        .execute();
    }
    
    return db.select()
      .from(opportunities)
      .where(eq(opportunities.status, statusFilter))
      .limit(Number(limit) || 20)
      .offset(Number(offset) || 0)
      .orderBy(opportunities.createdAt)
      .execute();
  }

  async findOne(id: string) {
    const res = await db.select().from(opportunities).where(eq(opportunities.id, id)).execute();
    return res[0];
  }

  async create(dto: CreateOpportunityDto) {
    const result = await db.insert(opportunities).values({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      type: dto.type || 'scholarship',
      eligibilityCriteria: dto.eligibilityCriteria,
      fundingType: dto.fundingType,
      targetRegion: dto.targetRegion,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      sourceUrl: dto.sourceUrl,
      applyUrl: dto.applyUrl || dto.sourceUrl,
      imageUrl: dto.imageUrl,
      isRemote: dto.isRemote ?? true,
      status: dto.status || 'pending',
      originalJson: JSON.stringify(dto),
    }).returning().execute();
    
    return result[0];
  }

  async update(id: string, data: Partial<CreateOpportunityDto>) {
    const updateData: any = { ...data };
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline);
    }
    updateData.updatedAt = new Date();

    const result = await db.update(opportunities)
      .set(updateData)
      .where(eq(opportunities.id, id))
      .returning()
      .execute();
    
    return result[0];
  }

  async updateStatus(id: string, status: string) {
    await db.update(opportunities).set({ status, updatedAt: new Date() }).where(eq(opportunities.id, id)).execute();
    return this.findOne(id);
  }

  async remove(id: string) {
    await db.delete(opportunities).where(eq(opportunities.id, id)).execute();
    return { success: true, id };
  }

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronSync() {
    this.logger.log('Starting scheduled Opportunities Sync via Serper API + Gemini');
    await this.syncOpportunities();
  }

  async syncOpportunities() {
    try {
      // 1. Fetch from Serper API
      const aiData = await this.fetchFromSerper();
      if (!aiData || aiData.length === 0) {
        this.logger.warn('No data found from Serper API');
        return;
      }

      // 2. Process with Gemini to extract structured JSON
      const parsedData = await this.extractWithGemini(aiData);

      // 3. Save to DB handling duplicates gracefully via native PostgreSQL constraints
      if (parsedData && parsedData.length > 0) {
        let inserted = 0;
        for (const item of parsedData) {
            try {
              await db.insert(opportunities).values({
                  title: item.title,
                  description: item.description,
                  eligibilityCriteria: item.eligibilityCriteria,
                  fundingType: item.fundingType,
                  targetRegion: item.targetRegion,
                  type: 'scholarship', // default type we are searching for
                  sourceUrl: item.sourceUrl,
                  applyUrl: item.applyUrl || item.sourceUrl,
                  imageUrl: item.imageUrl,
                  originalJson: JSON.stringify(item),
                  status: 'pending', // Requires manual admin approval
              }).onConflictDoNothing({ target: opportunities.sourceUrl }).execute();
              inserted++;
            } catch (dbErr) {
              this.logger.warn(`Failed to insert opportunity (duplicate or constraint error): ${item.sourceUrl}`);
            }
        }
        this.logger.log(`Successfully synced and parsed new opportunities. Inserted/Ignored: ${inserted}.`);
        return { success: true, count: inserted };
      }
      return { success: false, reason: 'Failed to extract data' };

    } catch (error) {
      this.logger.error('Error syncing opportunities', error);
      throw error;
    }
  }

  private async fetchFromSerper() {
    const searchQueries = [
      "latest scholarships for african students 2026",
      "fully funded scholarships for international students from africa",
      "master degree scholarships for african youth",
      "undergraduate scholarships abroad for africans",
      "global grants and fellowships for young africans",
      "top international study opportunities for african citizens"
    ];

    // Pick a query based on the current day to rotate daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const query = searchQueries[dayOfYear % searchQueries.length];

    // Expand search depth: We rotate the start array (Google pages 1, 2, 3) 
    // to prevent fetching the same static 10 results over and over (Data Drought)
    const hourRotation = new Date().getHours(); 
    const scrapeStart = (hourRotation % 5) * 10; // Rotates offsets: 0, 10, 20, 30, 40

    this.logger.log(`Using Serper search query: "${query}" (Offset: ${scrapeStart})`);

    const data = JSON.stringify({
      "q": query,
      "num": CHUNKS_TO_FETCH,
      "page": (scrapeStart / 10) + 1  // Serper handles page number or offset
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json'
      },
      data : data
    };

    const response = await axios.request(config);
    return response.data.organic; // returns an array of organic search results
  }

  private async extractWithGemini(searchResults: any[]) {
      const prompt = `
      You are an expert scholarship data extractor. I have obtained the following Google Search results.
      
      Extract the opportunities into an array of JSON objects. For each opportunity, find the:
      - title
      - description (a good short summary)
      - eligibilityCriteria (who can apply?)
      - fundingType (e.g., fully funded, partial, $5000)
      - targetRegion (e.g., Africa, Nigeria, Global)
      - sourceUrl (the link provided)
      - applyUrl (the direct link to apply if available, otherwise just use the sourceUrl)
      - imageUrl (a valid image URL from the snippet/metadata if present, otherwise null)

      Output ONLY a valid JSON array.

      Here is the raw data:
      ${JSON.stringify(searchResults)}
      `;

      try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                // Ensure output is strictly JSON
                responseMimeType: "application/json",
            }
        });

        const textOutput = response.text;
        const parsedJson = JSON.parse(textOutput);
        
        // Strictly validate schema to prevent cron crashes
        const result = GeminiResponseSchema.safeParse(parsedJson);
        if (!result.success) {
            this.logger.error('Gemini extraction failed Zod validation', result.error);
            // Optionally, return valid items if we iterate instead of rejecting the whole batch
            return [];
        }
        
        return result.data;
      } catch (err) {
          this.logger.error('Gemini extraction failed', err);
          return [];
      }
  }
}

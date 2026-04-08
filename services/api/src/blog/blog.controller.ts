import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateCommentDto } from './blog.dto';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get()
    async findAll(
        @Query('status') status?: 'draft' | 'published' | 'archived',
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('featured') featured?: boolean,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.blogService.findAll({
            status,
            category,
            tag,
            featured: featured === 'true',
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });
    }

    @Get('categories')
    async getCategories() {
        return this.blogService.getCategories();
    }

    @Get('featured')
    async findFeatured() {
        return this.blogService.findAll({ featured: true, limit: 6 });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.blogService.findOne(id);
    }

    @Get('slug/:slug')
    async findOneBySlug(@Param('slug') slug: string) {
        return this.blogService.findOneBySlug(slug);
    }

    @Post()
    async create(@Body() data: CreateBlogPostDto) {
        return this.blogService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdateBlogPostDto) {
        return this.blogService.update(id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        await this.blogService.delete(id);
    }

    @Get(':id/comments')
    async getComments(@Param('id') id: string) {
        return this.blogService.getComments(id);
    }

    @Post('comments')
    async addComment(@Body() data: CreateCommentDto) {
        return this.blogService.addComment(data);
    }

    @Put('comments/:commentId/moderate')
    async moderateComment(
        @Param('commentId') commentId: string,
        @Body('status') status: 'approved' | 'rejected',
    ) {
        return this.blogService.moderateComment(commentId, status);
    }

    @Post(':id/like')
    @HttpCode(HttpStatus.OK)
    async likePost(@Param('id') id: string) {
        return this.blogService.likePost(id);
    }
}

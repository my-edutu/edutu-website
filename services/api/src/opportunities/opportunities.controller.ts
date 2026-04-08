import { Controller, Get, Post, Body, Param, Patch, Query, ForbiddenException, Delete } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CurrentUser, Public } from '../auth';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Public()
  @Get()
  findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.opportunitiesService.findAll(limit, offset, status, category);
  }

  @Get('sync')
  triggerSync(@CurrentUser() user: any) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.syncOpportunities();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Post()
  create(
    @Body() createDto: CreateOpportunityDto,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateOpportunityDto>,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.update(id, updateData);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.updateStatus(id, status);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.updateStatus(id, 'active');
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.updateStatus(id, 'rejected');
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.opportunitiesService.remove(id);
  }
}

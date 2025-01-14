import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    createTaskDto['user'] = req.user.userId;
    return this.taskService.create(createTaskDto);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async findAll(
    @Query() filterTaskDto: FilterTaskDto,
    @Query() paginationDto: PaginationDto,
    @Req() req,
  ) {
    const result = await this.taskService.findAll(
      req.user.userId,
      filterTaskDto,
      paginationDto,
    );
    return {
      tasks: result.tasks,
      total: result.total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Patch('bulk-update-status')
  @UsePipes(new ValidationPipe({ transform: true }))
  bulkUpdateStatus(
    @Body() bulkUpdateStatusDto: BulkUpdateStatusDto,
    @Req() req,
  ) {
    return this.taskService.bulkUpdateStatus(
      req.user.userId,
      bulkUpdateStatusDto.task_ids,
      bulkUpdateStatusDto.status,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.taskService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    return this.taskService.update(id, req.user.userId, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.taskService.remove(id, req.user.userId);
    return {
      message: `Task with ID ${id} deleted`,
    };
  }

  @Delete(':id/soft')
  async softDelete(@Param('id') id: string, @Req() req) {
    await this.taskService.softDelete(id, req.user.userId);
    return {
      message: `Task with ID ${id} soft deleted`,
    };
  }
}

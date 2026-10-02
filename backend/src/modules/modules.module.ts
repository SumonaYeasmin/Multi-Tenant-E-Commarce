import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './ower/category/category.module';
import { BrandModule } from './ower/brand/brand.module';
import { CollectionModule } from './ower/collection/collection.module';

@Module({
  imports: [AuthModule, CategoryModule, BrandModule, CollectionModule],
})
export class ModulesModule {}

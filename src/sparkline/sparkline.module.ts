import { NgModule } from '@angular/core';
import { ChartCommonModule } from '../common/chart-common.module';
import { SparklineComponent } from './sparkline.component';

@NgModule({
  imports: [ChartCommonModule],
  declarations: [
    SparklineComponent
  ],
  exports: [
    SparklineComponent
  ]
})
export class SparklineModule {}

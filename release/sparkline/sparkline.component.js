var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, ViewEncapsulation } from '@angular/core';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { curveLinear } from 'd3-shape';
import { BaseChartComponent, calculateViewDimensions, ColorHelper, getUniqueXDomainValues } from '../common';
// Copied from here:
// https://github.com/swimlane/ngx-charts/blob/master/src/app/custom-charts/sparkline/sparkline.component.ts
var SparklineComponent = /** @class */ (function (_super) {
    __extends(SparklineComponent, _super);
    function SparklineComponent(chartElement, zone, cd) {
        var _this = _super.call(this, chartElement, zone, cd) || this;
        _this.chartElement = chartElement;
        _this.zone = zone;
        _this.cd = cd;
        _this.autoScale = false;
        _this.curve = curveLinear;
        _this.scheme = 'cool';
        _this.schemeType = 'linear';
        _this.animations = true;
        _this.margin = [0, 0, 0, 0];
        return _this;
    }
    SparklineComponent.prototype.update = function () {
        _super.prototype.update.call(this);
        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin,
            showXAxis: false,
            showYAxis: false,
            xAxisHeight: 0,
            yAxisWidth: 0,
            showXLabel: false,
            showYLabel: false,
            showLegend: false,
            legendType: this.schemeType
        });
        this.xDomain = this.getXDomain();
        this.yDomain = this.getYDomain();
        this.seriesDomain = this.getSeriesDomain();
        this.xScale = this.getXScale(this.xDomain, this.dims.width);
        this.yScale = this.getYScale(this.yDomain, this.dims.height);
        this.setColors();
        this.transform = "translate(" + this.dims.xOffset + " , " + this.margin[0] + ")";
    };
    SparklineComponent.prototype.getXDomain = function () {
        var values = getUniqueXDomainValues(this.results);
        this.scaleType = this.getScaleType(values);
        var domain;
        if (this.scaleType === 'time') {
            var min = Math.min.apply(Math, values);
            var max = Math.max.apply(Math, values);
            domain = [min, max];
        }
        else if (this.scaleType === 'linear') {
            values = values.map(function (v) { return Number(v); });
            var min = Math.min.apply(Math, values);
            var max = Math.max.apply(Math, values);
            domain = [min, max];
        }
        else {
            domain = values;
        }
        this.xSet = values;
        return domain;
    };
    SparklineComponent.prototype.getYDomain = function () {
        if (this.valueDomain) {
            return this.valueDomain;
        }
        var domain = [];
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var results = _a[_i];
            for (var _b = 0, _c = results.series; _b < _c.length; _b++) {
                var d = _c[_b];
                if (domain.indexOf(d.value) < 0) {
                    domain.push(d.value);
                }
                if (d.min !== undefined) {
                    if (domain.indexOf(d.min) < 0) {
                        domain.push(d.min);
                    }
                }
                if (d.max !== undefined) {
                    if (domain.indexOf(d.max) < 0) {
                        domain.push(d.max);
                    }
                }
            }
        }
        var min = Math.min.apply(Math, domain);
        var max = Math.max.apply(Math, domain);
        if (!this.autoScale) {
            min = Math.min(0, min);
        }
        return [min, max];
    };
    SparklineComponent.prototype.getSeriesDomain = function () {
        return this.results.map(function (d) { return d.name; });
    };
    SparklineComponent.prototype.getXScale = function (domain, width) {
        var scale;
        if (this.scaleType === 'time') {
            scale = scaleTime()
                .range([0, width])
                .domain(domain);
        }
        else if (this.scaleType === 'linear') {
            scale = scaleLinear()
                .range([0, width])
                .domain(domain);
        }
        else if (this.scaleType === 'ordinal') {
            scale = scalePoint()
                .range([0, width])
                .padding(0.1)
                .domain(domain);
        }
        return scale;
    };
    SparklineComponent.prototype.getYScale = function (domain, height) {
        return scaleLinear()
            .range([height, 0])
            .domain(domain);
    };
    SparklineComponent.prototype.getScaleType = function (values) {
        var date = true;
        var num = true;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            if (!this.isDate(value)) {
                date = false;
            }
            if (typeof value !== 'number') {
                num = false;
            }
        }
        if (date) {
            return 'time';
        }
        if (num) {
            return 'linear';
        }
        return 'ordinal';
    };
    SparklineComponent.prototype.isDate = function (value) {
        return value instanceof Date;
    };
    SparklineComponent.prototype.trackBy = function (index, item) {
        return item.name;
    };
    SparklineComponent.prototype.setColors = function () {
        var domain = this.schemeType === 'ordinal' ? this.seriesDomain : this.yDomain;
        this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "autoScale", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "curve", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "results", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "scheme", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "schemeType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], SparklineComponent.prototype, "valueDomain", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SparklineComponent.prototype, "animations", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], SparklineComponent.prototype, "view", void 0);
    SparklineComponent = __decorate([
        Component({
            selector: 'ngx-charts-sparkline',
            templateUrl: './sparkline.component.html',
            styleUrls: ['../common/base-chart.component.css'],
            encapsulation: ViewEncapsulation.None,
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ElementRef, NgZone, ChangeDetectorRef])
    ], SparklineComponent);
    return SparklineComponent;
}(BaseChartComponent));
export { SparklineComponent };
//# sourceMappingURL=sparkline.component.js.map
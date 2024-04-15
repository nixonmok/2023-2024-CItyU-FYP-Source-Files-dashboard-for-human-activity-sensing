import chart from "@/app/devices/sensors/chart";
import BarPieChartOption, { chartValue } from "./barPieChartOption";
import LineNumberChartOption from "./numberLineChartOption";
import { webSocketData } from "./page";
import GaugeChartOption from "./gaugeChartOption";
import ScatterChartOption from "./scatterChartOption";

interface chartOptionProps {
    chartType: string,
    payload: webSocketData
    closeChartOptionAndConstructChart: (chartValues: chartValue[], selectedXAxis: string) => void
}

export default function chartOption(chartOptionProps: chartOptionProps) {

    return (

        <div id="list-here" className="flex-grow m-3 overflow-hidden hover:overflow-y-scroll">
            {chartOptionProps.chartType === 'Bar Chart' || chartOptionProps.chartType === 'Pie Chart' ?
                <BarPieChartOption
                    closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                    payload={chartOptionProps.payload} /> : chartOptionProps.chartType === 'Line Chart' || chartOptionProps.chartType === 'Number' ?
                    <LineNumberChartOption
                        closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                        payload={chartOptionProps.payload} /> : chartOptionProps.chartType === 'Gauge Chart' ? <GaugeChartOption closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                            payload={chartOptionProps.payload} /> : <ScatterChartOption closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                                payload={chartOptionProps.payload} />
            }
        </div>
    )
}
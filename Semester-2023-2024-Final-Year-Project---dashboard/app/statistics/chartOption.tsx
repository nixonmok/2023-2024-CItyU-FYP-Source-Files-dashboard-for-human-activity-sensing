import chart from "@/app/devices/sensors/chart";
import BarPieChartOption, { chartValue } from "./barPieChartOption";
import LineChartOption from "./lineChartOption";
import ScatterChartOption from "./scatterChartOption";

//interface import
import {payloadFromDatabase} from './analysisBox'

interface chartOptionProps {
    chartType: string,
    payloads: payloadFromDatabase[],
    closeChartOptionAndConstructChart: (chartValues: chartValue[], selectedXAxis: string) => void
}

export default function chartOption(chartOptionProps: chartOptionProps) {

    return (

        <div id="list-here" className="flex-grow m-3 overflow-hidden hover:overflow-y-scroll">
            {chartOptionProps.chartType === 'Bar Chart' || chartOptionProps.chartType === 'Pie Chart' ?
                <BarPieChartOption
                    closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                    payloads={chartOptionProps.payloads} /> : chartOptionProps.chartType === 'Line Chart' ?
                    <LineChartOption
                        closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                        payloads={chartOptionProps.payloads} /> : <ScatterChartOption closeChartOptionAndConstructChart={chartOptionProps.closeChartOptionAndConstructChart}
                                payloads={chartOptionProps.payloads} />
            }
        </div>
    )
}
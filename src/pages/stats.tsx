import React from 'react';
import EchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

const Stats = (): JSX.Element => {
    return (
        <>
            <EchartsCore
                echarts={echarts}
                option={{
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [
                        {
                            data: [820, 932, 901, 934, 1290, 1330, 1320],
                            type: 'line',
                        },
                    ],
                }}
            />
        </>
    );
};

export default Stats;

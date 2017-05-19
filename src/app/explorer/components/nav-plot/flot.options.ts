export const FLOT_OPTIONS = {
		grid: {
			backgroundColor: "#FFFFFF",
		},
		xaxis:{
			mode:"time",
			timezone: "browser",
			min: 0,
			max: 0
		},
		yaxis:{
			//min: 0,
			//max: 10
		},
		yaxes:[
			{
				show: false
			},
			{
				show: false
				//axisLabelPadding: 10,
			}],
		legend: {
			show: false
		},
		selection: {
			mode: "x"
		},
		//shadowSize: 0,
		series:{
			lines:{
				show: true,
				fill: false,
				//lineWidth: 1,
			}
		}
	};
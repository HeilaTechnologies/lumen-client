
import * as plot from './plot';
import * as measurement from './measurement';
import * as interfaces from './interfaces';
import {combineReducers } from 'redux';
export {IRange, IAxisSettings} from './helpers';
export {PlotActions} from './plot/actions';
export {MeasurementActions} from './measurement/actions';
export {InterfaceActions} from './interfaces/actions';
//   TOP LEVEL: Measurement, Plot
export interface IState {
  plot?: plot.IState,
  measurement?: measurement.IState,
  interfaces?: interfaces.IState
}
export const reducer = combineReducers<IState>({
  plot: plot.reducer,
  measurement: measurement.reducer,
  interfaces: interfaces.reducer
})
import { Injectable } from '@angular/core';
import { NgRedux } from 'ng2-redux';
import {
  ExplorerActions,
  IRange
} from './store';
import { IAppState } from '../app.store';
import { MessageService } from '../services/';
import { 
  IDbElement,
  IDataSet 
} from '../store/data';
import {
  DataService,
  DbElementService,
} from '../services';

@Injectable()
export class ExplorerService {

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private messageService: MessageService,
    private dataService: DataService,
    private elementService: DbElementService
  ) { }

  public plotElement(element, axis: string = 'either') {
    this.elementService.assignColor(element);
    this.ngRedux.dispatch({
      type: ExplorerActions.PLOT_ELEMENT,
      payload: element
    })
  }
  public hideElement(element) {
    this.elementService.removeColor(element);
    this.ngRedux.dispatch({
      type: ExplorerActions.HIDE_ELEMENT,
      payload: element
    })
  }
  public showPlot() {
    if (this.ngRedux.getState().ui.explorer.show_plot == false)
      this.ngRedux.dispatch({
        type: ExplorerActions.SHOW_PLOT
      })
  }
  public hidePlot() {
    if (this.ngRedux.getState().ui.explorer.show_plot)
      this.ngRedux.dispatch({
        type: ExplorerActions.HIDE_PLOT
      })
  }
  public loadPlotData(
    elements: IDbElement[],
    timeRange: IRange
  ){
    let existingData = this.ngRedux.getState().ui.explorer.plot_data;
    let neededElements = this.findNeededElements(elements, existingData, timeRange);
    if(neededElements.length==0)
      return; //nothing to do
    this.dataService.loadData(timeRange.min, timeRange.max, neededElements)
      .subscribe(data => {
        this.ngRedux.dispatch({
          type: ExplorerActions.ADD_PLOT_DATA,
          payload: data
        })
      })
  }
  public loadNavData(
    elements: IDbElement[],
    timeRange: IRange
  ){
    let existingData = this.ngRedux.getState().ui.explorer.nav_data;
    let neededElements = this.findNeededElements(elements, existingData, timeRange);
    if(neededElements.length==0)
      return; //nothing to do
    this.dataService.loadData(timeRange.min, timeRange.max, neededElements)
      .subscribe(data => {
        this.ngRedux.dispatch({
          type: ExplorerActions.ADD_NAV_DATA,
          payload: data
        })
      })
  }

  
  public setPlotTimeRange(range: IRange) {
    this.ngRedux.dispatch({
      type: ExplorerActions.SET_PLOT_TIME_RANGE,
      payload: range
    })
  }

  ///------ helpers ------------

  private findNeededElements(
    elements: IDbElement[],
    existingData: IDataSet,
    timeRange: IRange
  ) {
    return elements
      .filter(e => {
        let data = existingData[e.id];
        if (data === undefined || data == null) {
          return true;
        } else if (data.start_time != timeRange.min || data.end_time != timeRange.max) {
          return true;
        } else {
          return false;
        }
      })
  }


}
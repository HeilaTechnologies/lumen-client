import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Angular2TokenService } from 'angular2-token';
import { Observable } from 'rxjs';
import { compressToEncodedURIComponent } from 'lz-string';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { normalize } from 'normalizr';
import * as _ from 'lodash';
import * as schema from '../../api';
import { MessageService } from '../message.service';
import { IAppState } from '../../app.store';
import { DbElementService } from './db-element.service';
import { DbStreamService } from './db-stream.service'
import { ColorService } from './color.service';
import { DataViewFactory } from '../../store/data';
import {
  IDbElementRecords,
  DbElementActions,
  IDataView,
  IData,
  IDataViewRedux,
  DataViewActions
} from '../../store/data';

import * as explorer from '../../explorer/store';

export const MAX_SAVE_DATA_LENGTH = 200;

@Injectable()
export class DataViewService {


  private dataViewsLoaded: boolean;
  private homeViewRestored: boolean; //only load the home view once

  constructor(
    private tokenService: Angular2TokenService,
    private ngRedux: NgRedux<IAppState>,
    private messageService: MessageService,
    private elementService: DbElementService,
    private streamService: DbStreamService,
    private colorService: ColorService,
  ) {
    this.dataViewsLoaded = false;
  }

  // ---- HTTP API Functions ----------

  //retrive data views from server
  //
  public loadDataViews() {
    if (this.dataViewsLoaded) {
      return Observable.empty<any>();
    }

    let o = this.tokenService
      .get('data_views.json', {})
      .map(resp => resp.json())
      .map(json => normalize(json, schema.dataViews).entities)

    o.subscribe(
      entities => {
        this.dataViewsLoaded = true;
        this.ngRedux.dispatch({
          type: DataViewActions.RECEIVE,
          payload: entities['data_views']
        })
      },
      error => this.messageService.setErrorsFromAPICall(error)
    );
    return o; //for other subscribers
  }

  //remove a data view owned by the current user
  //
  public deleteDataView(view: IDataView) {
    this.tokenService
      .delete(`data_views/${view.id}`)
      .map(resp => resp.json())
      .subscribe(
      json => {
        this.ngRedux.dispatch({
          type: DataViewActions.REMOVE,
          payload: view.id
        })
        this.messageService.setMessages(json.messages);
      },
      error => this.messageService.setErrorsFromAPICall(error)
      )
  }


  //create a new data view
  //
  public create(name: string, description: string, isPrivate: boolean, isHome: boolean, image: string) {

    let state = this.getDataViewState(true);

    let visibility = isPrivate ? 'private' : 'public'
    let params = {
      name: name,
      description: description,
      image: image,
      visibility: visibility,
      stream_ids: state.stream_ids,
      home: isHome,
      redux_json: compressToEncodedURIComponent(JSON.stringify(state.redux))
    }
    let o = this.tokenService
      .post('data_views.json', JSON.stringify(params))
      .map(resp => resp.json())
      .do(json => this.messageService.setMessages(json.messages))
      .map(json => normalize(json.data, schema.dataView).entities)

    o.subscribe(
      entities => {
        this.ngRedux.dispatch({
          type: DataViewActions.RECEIVE,
          payload: entities['data_views']
        })
      },
      error => this.messageService.setErrorsFromAPICall(error)
    );
    return o;
  }

  //update an existing data view
  //
  public update(view: IDataView) {
    let o = this.tokenService
      .put(`data_views/${view.id}.json`, {
        name: view.name,
        description: view.description,
        visibility: view.private ? 'private' : 'public',
        home: view.home
      })
      .map(resp => resp.json())
      .do(json => this.messageService.setMessages(json.messages))
      .map(json => normalize(json.data, schema.dataView).entities)

    o.subscribe(
      entities => {
        this.ngRedux.dispatch({
          type: DataViewActions.RECEIVE,
          payload: entities['data_views']
        })
      },
      error => this.messageService.setErrorsFromAPICall(error)
    );
    return o;
  }

  //load and restore a user's home view
  //
  public restoreHomeDataView() {
    if (this.homeViewRestored)
      return;
    this.homeViewRestored = true;
    this.tokenService
      .get('data_views/home.json', {})
      .map(resp => resp.json())
      .map(json => normalize(json, schema.dataView))
      .map(json => json.entities.data_views[json.result])
      .map(json => DataViewFactory(json))
      .subscribe(
      view => this.restoreDataView(view),
      error => console.log("unable to load home data view")
      );
  }

  //------------------ Local Functions -----------------------
  // Restore:
  // Set redux state from data view
  //
  public restoreDataView(view: IDataView) {
    //first clear the plot
    this.elementService.resetElements();
    this.ngRedux.dispatch({
      type: explorer.ExplorerActions.HIDE_ALL_ELEMENTS,
    })
    //now set the plot & nav time ranges so we don't reload the data 
    //(they are null after HIDE_ALL_ELEMENTS)
    this.ngRedux.dispatch({
      type: explorer.ExplorerActions.SET_PLOT_TIME_RANGE,
      payload: view.redux.ui_explorer.plot_time
    })
    this.ngRedux.dispatch({
      type: explorer.ExplorerActions.SET_NAV_TIME_RANGE,
      payload: view.redux.ui_explorer.nav_time
    })
    //now load the data elements
    this.elementService.restoreElements(view.redux.data_dbElements)

    //register colors with color service
    let newElements = view.redux.data_dbElements;
    Object.keys(newElements)
      .map(id => newElements[id])
      .map(element => {
        this.colorService.checkoutColor(element.color);
      })
    //restore the plot
    this.ngRedux.dispatch({
      type: explorer.ExplorerActions.RESTORE_VIEW,
      payload: view.redux.ui_explorer
    });
    //load the associated streams if they haven't been retrieved already
    this.ngRedux.getState().data.dbStreams
    let viewStreamIds = _.uniq(_.keys(newElements)
      .map(id => newElements[id])
      .map(elem => elem.db_stream_id))
    let existingStreamIds = _.keys(this.ngRedux.getState().data.dbStreams)
      .map(id => parseInt(id))
    let newStreamIds = _.difference(viewStreamIds, existingStreamIds)
    if (newStreamIds.length > 0)
      this.streamService.loadStreams(newStreamIds)

  }

  // GetDataViewState:
  // Compute redux state for the data view
  //
  public getDataViewState(includeData: boolean): IDataViewState {
    let allElements = this.ngRedux.getState().data.dbElements;
    let explorerState = this.ngRedux.getState().ui.explorer;
    let plottedElements = _.concat(
      explorerState.left_elements,
      explorerState.right_elements)
      .reduce((acc, id) => {
        acc[id] = allElements[id];
        return acc
      }, {})

    //compute array of unique stream ids so we can organize
    //data views by permission on the server
    let stream_ids = _.uniq(Object.keys(plottedElements)
      .map(id => plottedElements[id].db_stream_id))
    //sanitize explorer ui state
    let ui_explorer = <explorer.IState>(<any>this.ngRedux.getState().ui.explorer).toJS();
    ui_explorer.show_date_selector = false; //hide in case it is visible
    if (includeData) {
      //remove nav_data and data that are not part of plottedElements
      ui_explorer.plot_data = Object.keys(plottedElements)
        .reduce((acc, id) => {
          let dataset = ui_explorer.plot_data[id];
          if (dataset === undefined) {
            return acc; //data is missing we can't save it
          }
          acc[id] = this.decimateDataset(dataset);
          return acc;
        }, {})
      ui_explorer.nav_data = Object.keys(plottedElements)
        .reduce((acc, id) => {
          let dataset = ui_explorer.nav_data[id];
          if (dataset === undefined) {
            return acc; //data is missing we can't save it
          }
          acc[id] = this.decimateDataset(dataset);
          return acc;
        }, {})
    } else {
      ui_explorer.plot_data = {};
      ui_explorer.nav_data = {};
    }
    return {
      redux: {
        ui_explorer: ui_explorer,
        data_dbElements: plottedElements
      },
      stream_ids: stream_ids
    }
  }

  public decimateDataset(dataset: IData) {
    let smallDataset: IData = { //manually copy so this is not an immutable record
      data: dataset.data,
      end_time: dataset.end_time,
      start_time: dataset.start_time,
      valid: dataset.valid,
      type: dataset.type
    }
    let data = dataset.data
    if (data !== undefined && data.length > MAX_SAVE_DATA_LENGTH) {
      //we need to decimate the data, there is too much
      smallDataset.data = [];
      //remove time stamps so the client will automatically reload this
      //data at the full resolution
      smallDataset.end_time = 0;
      smallDataset.start_time = 0;
      let step = Math.ceil(data.length / MAX_SAVE_DATA_LENGTH)
      for (let i = 0; i < data.length; i = i + step) {
        smallDataset.data.push(data[i])
      }
      //console.log('orig, decimated:', data.length, smallDataset.data.length)
    } else {
      //console.log('no decimation required: ',data.length, smallDataset.data.length);
    }
    return smallDataset

  }
}

export interface IDataViewState {
  redux: IDataViewRedux
  stream_ids: Array<number>
}


import { Component, OnInit, ViewChild } from '@angular/core';
import {
  trigger, animate, style, transition
} from '@angular/animations';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { select } from '@angular-redux/store';


import { DataViewService } from '../../../services';
import { DataViewFactory } from '../../../store/data';
import { IExplorer } from '../../store';
import { ExplorerSelectors } from '../../explorer.selectors';
import { ExplorerService } from '../../explorer.service';
import {
  IDbElement,
  IDataView,
  IDbElementRecords
} from '../../../store/data';
import { MainPlotComponent } from '../../components/main-plot/main-plot.component';

@Component({
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(100, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])]),
    trigger('fadeOut', [
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])])
  ],
  selector: 'app-explorer-page',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.css']
})
export class ExplorerPageComponent implements OnInit {

  public plotZValue$: Observable<number>;
  public imageData: string;
  @ViewChild('imageModal') public imageModal: ModalDirective;
  @ViewChild('saveDataViewModal') public saveDataViewModal: ModalDirective;
  @ViewChild('loadDataViewModal') public loadDataViewModal: ModalDirective;

  @ViewChild('plot') public plot: MainPlotComponent;

  public newDataView: IDataView;

  constructor(
    public explorerSelectors: ExplorerSelectors,
    public explorerService: ExplorerService,
    public dataViewService: DataViewService,
  ) {
    this.plotZValue$ = this.explorerSelectors.showDateSelector$
      .map(show => {
        if (show)
          return -1;
        else
          return 0;
      })
  }

  showSaveDataView() {
    this.plot.getCanvas().then(canvas => {
      this.imageData = canvas.toDataURL("image/png");
      this.saveDataViewModal.show();
    });
  }

  createDataView(view: IDataView) {
    this.dataViewService.create(
      view.name, 
      view.description, 
      view.private, 
      view.home, 
      view.image);
    this.saveDataViewModal.hide();
  }
  showSavePlotImage() {
    this.plot.getCanvas().then(canvas => {
      this.imageData = canvas.toDataURL("image/png");
      this.imageModal.show();
    });
  }
  showLoadDataView() {
    this.dataViewService.loadDataViews();
    this.loadDataViewModal.show();
  }
  ngOnInit() {
    console.log("restoring home view...")
    this.dataViewService.restoreHomeDataView();
  }



}

import { 
  Component, 
  Input,
  ViewChild, 
  OnInit 
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
/*https://github.com/yuyang041060120/ng2-validation*/
import { CustomValidators } from 'ng2-validation';
import {Router} from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap/modal';

import {
  NilmService,
} from '../../../services';

import {
  INilm
} from '../../../store/data';

import {InstallationService} from '../../installation.service';

@Component({
  selector: 'app-edit-nilm',
  templateUrl: './edit-nilm.component.html',
  styleUrls: ['./edit-nilm.component.css']
})

export class EditNilmComponent implements OnInit {
  @Input() nilm: INilm
  @ViewChild('removeNilmModal') public removeNilmModal:ModalDirective;

  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private nilmService: NilmService,
    private installationService: InstallationService
  )
   { }

  ngOnInit() {
    this.buildForm(this.nilm);
  }

  buildForm(nilm: INilm){
    this.form = this.fb.group({
      name: [nilm.name, Validators.required],
      description: [nilm.description],
      url: [nilm.url, Validators.required],
    });
  }

  refreshNilm(){
    this.installationService.refreshNilm(this.nilm);
  }
  removeNilm(){
    this.nilmService.removeNilm(this.nilm)
    .subscribe(
      success => {
        //can't view the nilm anymore, so change the page
        //back to the user account
        this.removeNilmModal.hide();
        this.router.navigate(['/account'])
      }
    )
  }
  updateNilm(values: any){
    this.nilmService.updateNilm(
      this.nilm, 
      values.name, 
      values.description, 
      values.url
    );
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService, LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';
import { ToastService } from '../services/toast.service';
import { Constants } from '../utils/constants/misc';

@Component({
  selector: 'app-enforcement-actions',
  templateUrl: './enforcement-actions.component.html',
  styleUrls: ['./enforcement-actions.component.css']
})
export class EnforcementActionsComponent implements OnInit {
  public pageText = '';
  public pageTextDraft = '';
  private pageTextId = '';
  public pageTextEditing = false;
  public tinyMceSettings = {
    base_url: '/tinymce',
    suffix: '.min',
    browser_spellcheck: true,
    height: 240,
    plugins: ['lists, advlist, link'],
    toolbar: ['undo redo | formatselect | ' +
      ' bold italic backcolor | alignleft aligncenter ' +
      ' alignright alignjustify | bullist numlist outdent indent |' +
      ' removeformat | help']
  };

  // If there is no existing page text, we set the page to post mode
  // else we're doing a put
  public pageTextExists = false;

  constructor(
    private loadingScreenService: LoadingScreenService,
    private configService: ConfigService,
    private factoryService: FactoryService,
    private toastService: ToastService,
    public router: Router
  ) {
    if (this.configService.config.ENFORCEMENT_ACTION_TEXT) {
      this.pageTextExists = true;
      this.pageText = this.configService.config.ENFORCEMENT_ACTION_TEXT.data.text;
      this.pageTextId = this.configService.config.ENFORCEMENT_ACTION_TEXT._id;
    }
  }

  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(false, 'body');
  }

  async saveText() {
    const configData = {
      configType: 'enforcementActionText',
      text: this.pageTextDraft
    };
    try {
      if (!this.pageTextExists) {
        const res = await this.factoryService.createConfigData(configData, 'BCMI');
        this.configService.config.ENFORCEMENT_ACTION_TEXT = res;
        this.pageTextId = res['_id'];
      } else {
        const res = await this.factoryService.editConfigData(configData, this.pageTextId, 'BCMI');
        this.configService.config.ENFORCEMENT_ACTION_TEXT = res;
      }
      this.toastService.addMessage('Enforcement text update', 'Success updated', Constants.ToastTypes.SUCCESS);
      this.pageText = this.pageTextDraft;
      this.pageTextDraft = '';
      this.pageTextEditing = false;
      this.pageTextExists = true;
    } catch (error) {
      console.log(error);
      this.toastService.addMessage(
        'An error has occured while saving and publishing',
        'Save unsuccessful',
        Constants.ToastTypes.ERROR
      );
    }
  }

  setEditingMode() {
    this.pageTextDraft = this.pageText;
    this.pageTextEditing = true;
  }

  cancelEditing() {
    this.pageTextEditing = false;
  }


  add(item) {
    this.router.navigate(['records', item, 'add']);
  }

}

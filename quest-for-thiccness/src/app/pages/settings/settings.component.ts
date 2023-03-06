import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WhyareufragileComponent } from 'src/app/components/whyareufragile/whyareufragile.component';
import { CommonService } from 'src/app/services/commonService';
import { InsultService } from 'src/app/services/insultService';
import { ThemeService } from 'src/app/services/themeService';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [ DialogService]
})
export class SettingsComponent 
{
  private ref: DynamicDialogRef | undefined;
  public selectedTheme: string | undefined;
  public selectedInsultSetting: string | undefined;
  public selectedDefaultPage: string | undefined;
  public customBankUrl: string | undefined;
  public selectedRestTimeSetting : string | undefined;

  constructor(public themeService: ThemeService,
              public insultService: InsultService,
              private dialogService: DialogService,
              public commonService: CommonService){}

  ngOnInit() 
  {
    this.selectedTheme = this.themeService.getMyCurrentTheme().themeName;
    this.selectedInsultSetting = this.insultService.isUserAPussy();
    this.selectedDefaultPage = this.commonService.getDefaultSettingForKey(this.commonService.DEFAULTPAGEKEY,"exercises");
    this.selectedRestTimeSetting = this.commonService.getDefaultSettingForKey(this.commonService.RESTCLOCKSETTING,"true");
  }

  // Have to implment the on Destroy because this component
  // can open modals with other components, need to ensure
  // that those components are disposed of properly
  ngOnDestroy() 
  {
    // need to destroy the pop-up if it exists
    if (this.ref) 
    {
      this.ref.close();
    }
  }

  changeInsultSetting(setting: string)
  {
    if(setting === 'false')
    {
      this.ref = this.dialogService.open(WhyareufragileComponent, 
        {
          header: 'Why are you so fragile?',
          // we dont want to let the user close this manully but rather add a confirm dialog.
          closable: true, 
          // This makes it look like 100% but its not because this 100% of the parrent
          width: '100%',
          contentStyle: {"overflow": "auto"},
          baseZIndex: 10000,
          maximizable: true,
        });
    }
    this.insultService.updateInsultsFlag(setting);
  }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// PrimeNG imports
import {TabMenuModule} from 'primeng/tabmenu';
import {MenuModule} from 'primeng/menu';
import {MenubarModule} from 'primeng/menubar';
import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import {SpeedDialModule} from 'primeng/speeddial';
import {TooltipModule} from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {CheckboxModule} from 'primeng/checkbox';
import {AccordionModule} from 'primeng/accordion';
import {CardModule} from 'primeng/card';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {TabViewModule} from 'primeng/tabview';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {KnobModule} from 'primeng/knob';
import {RadioButtonModule} from 'primeng/radiobutton';
import {SelectButtonModule} from 'primeng/selectbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ChartModule } from 'primeng/chart';

// my imports
import { AppComponent } from './app.component';
import { AppRoutingModule, RoutingComponents } from './app.routing.module';
import { CommonService } from './services/commonService';
import { ExcersizeformComponent } from './components/excersizeform/excersizeform.component';
import { CommonModule } from '@angular/common';
import { ExcersizeComponent } from './components/excersize/excersize.component';
import { VirginComponent } from './components/virgin/virgin.component';
import { WhyareufragileComponent } from './components/whyareufragile/whyareufragile.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { ExersizestatsComponent } from './components/exersizestats/exersizestats.component';

@NgModule({
  declarations: [
    AppComponent,
    RoutingComponents,
    ExcersizeformComponent,
    ExcersizeComponent,
    VirginComponent,
    WhyareufragileComponent,
    ExerciseListComponent,
    ExersizestatsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule, // our Routing module
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    MenuModule,
    MenubarModule,
    TableModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    SpeedDialModule,
    TooltipModule,
    TagModule,
    DynamicDialogModule,
    CheckboxModule,
    AccordionModule,
    CardModule,
    ConfirmPopupModule,
    ToggleButtonModule,
    InputTextareaModule,
    MessagesModule,
    MessageModule,
    TabViewModule,
    ProgressSpinnerModule,
    KnobModule,
    RadioButtonModule,
    SelectButtonModule,
    FileUploadModule,
    ChartModule
  ],
  providers: [CommonService],
  bootstrap: [AppComponent]
})
export class AppModule { }

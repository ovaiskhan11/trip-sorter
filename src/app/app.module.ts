import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {TripSorterComponent} from './trip-sorter/trip-sorter.component';
import {TripService} from './services/trip.service';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import {TypeaheadModule, TooltipModule} from "ngx-bootstrap";
import {Helper} from "./helpers/helper";

@NgModule({
    declarations: [
        AppComponent,
        TripSorterComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TypeaheadModule.forRoot(),
        TooltipModule.forRoot()
    ],
    providers: [
        TripService,
        Helper
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

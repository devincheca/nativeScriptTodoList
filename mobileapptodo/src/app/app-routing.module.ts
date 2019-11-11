import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
const appSettings = require("tns-core-modules/application-settings");

import { MainComponent } from "./main/main.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
    {
        path: "",
        redirectTo: appSettings.getString('token') === undefined
            || appSettings.getString('token') === ''
            ? "/login"
            : "/main",
        pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "main", component: MainComponent },
    { path: "main/:token", component: MainComponent } 
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }

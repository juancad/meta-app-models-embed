import { Application } from "./application.model";

export class User {
    username: string;
    password: string;
    email: string;
    apps: Array<Application>;

    constructor(username: string, password: string, email: string, apps: Array<Application>) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.apps = apps;
      }
}
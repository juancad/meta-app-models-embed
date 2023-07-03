import { Application } from "./application.model";

export class User {
    username: string;
    email: string;
    apps: Array<Application>;

    constructor(username: string, email: string, apps: Array<Application>) {
        this.username = username;
        this.email = email;
        this.apps = apps;
      }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ProjectFilterComponent } from './components/project-filter/project-filter.component';
import { InfoBarComponent } from './components/info-bar/info-bar.component';
import {  HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    InfoBarComponent,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'BMI - GETIT';

  isProdukteRoute: boolean = false;
  isVertrageRoute: boolean = false;
  isPersonenRoute: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Check the initial route
    this.checkRouteType(this.router.url);

    // Subscribe to route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.checkRouteType(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRouteType(url: string) {
    // Check if the current route is the personen, products or contracts route
    this.isPersonenRoute = url.includes('/personen');
    this.isProdukteRoute = url.includes('/produkte');
    this.isVertrageRoute = url.includes('/vertrage');
  }
}

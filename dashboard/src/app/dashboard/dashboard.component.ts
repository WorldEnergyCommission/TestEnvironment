import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SlideBackground, SlideElement, UserData } from 'src/data-types/userData';
import * as moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('carouselAnimation', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('1300ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  time = '';
  date = '';
  interval: any;
  carouselInterval: any;
  currentSlide = 0;
  @Input() userData?: UserData;
  gridHeight = 0;
  gridWidth = 0;
  mediumFontSize = '';
  largeFontSize = '';
  contentHeight = '75vh';
  private resizeObserver?: ResizeObserver;
  backgrounds = ['cs-aggregated-charged-energy.png', 'cs-aggregated-current-connected-cars.png',
    'photovoltaik.png', 'pv-aggregated-carbon-savings-symbolic.png', 'pv-aggregated-carbon-savings.png'];
  days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  loaded = 0;

  constructor(private cdf: ChangeDetectorRef) {
    this.time = moment().format('HH:mm');
    this.date = this.transform(moment());
  }

  transform(value: moment.Moment): string {
    return `${this.days[value.day() - 1]} | ${value.date()}. ${this.months[value.month()]} ${value.year()}`;
  }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      if (this.userData) {
        this.time = moment().tz(this.userData.timezone).format('HH:mm');
        this.date = this.transform(moment().tz(this.userData.timezone));
      }
      this.cdf.detectChanges();
    }, 4500);

    this.preloadImages();

    const element = document.getElementById('grid');

    this.resizeObserver = new ResizeObserver(() => {
      this.updateFontSize();
      this.updateSizes(element);
    });

    if (element) {
      this.resizeObserver.observe(element);
    }
  }

  updateFontSize(): void {
    const headerSize = this.getSize('header');
    if (headerSize) {
      const fontSize = (headerSize.width * 0.5 + window.innerHeight * 0.1) / 25;
      this.mediumFontSize = fontSize + 'px';
      this.largeFontSize = fontSize * 1.2 + 'px';

      const footerSize = this.getSize('footer');
      if (footerSize) {
        this.contentHeight = `${95 - ((headerSize.height + footerSize.height) / window.innerHeight * 100)}vh`;
      }
      this.cdf.detectChanges();
    }
  }

  getSize(name: string): any {
    const element = document.getElementById(name);
    if (element) {
        return {
            height: element.clientHeight,
            width: element.clientWidth
        }
    }

    return null;
}


  preloadImages() {
    for (let i = 0; i < this.backgrounds.length; i++) {
      let img = new Image();
      img.src = `assets/slider/${this.backgrounds[i]}`;
      img.onload = () => {
        this.loaded++;
        if (this.backgrounds.length == this.loaded) {
          this.start();
        }
      }
    }
  }

  updateSizes(element: HTMLElement | null): void {
    if (element) {
      this.gridHeight = Math.floor((element.clientHeight) / 6);
      this.gridWidth = Math.floor((element.clientWidth) / 6);
      this.cdf.detectChanges();
    }
  }

  start(): void {
    this.carouselInterval = setInterval(() => {
      if (this.userData && this.currentSlide + 1 >= this.userData.slides.length) {
        this.currentSlide = 0;
      } else {
        this.currentSlide = this.currentSlide + 1;
      }
      this.cdf.detectChanges();
    }, 70000);
  }

  stop(): void {
    clearInterval(this.carouselInterval);
    this.carouselInterval = null;
  }

  getModulePosition(module: SlideElement): any {
    if (this.gridHeight && this.gridWidth) {
      return {
        top: this.gridHeight * (module.position.row - 1) + 'px',
        left: this.gridWidth * (module.position.col - 1) + 'px',
        height: this.gridHeight * module.size.row - 3 + 'px',
        width: this.gridWidth * module.size.col - 3 + 'px',
      }
    }
  }

  getBackgroundPosition(background: SlideBackground): any {
    if (this.gridHeight && this.gridWidth) {
      return {
        top: this.gridHeight * (background.position.row - 1) + 'px',
        left: this.gridWidth * (background.position.col - 1) + 'px',
        height: this.gridHeight * background.size.row - 3 + 'px',
        width: this.gridWidth * background.size.col - 3 + 'px',
        'background-image': background.file ? 'url(assets/slider/' + background.file + ')' : '',
        'background-color': !background.file ? this.userData?.colors.primary : '',
      }
    }
  }

  showSlide(name: string): boolean {
    if (this.userData && this.userData.slides && this.userData.slides.length && this.currentSlide < this.userData.slides.length && name) {
      return this.userData.slides[this.currentSlide].modules.filter((a) => a.id === name).length > 0;
    }
    return false;
  }

  getCurrentModules(): SlideElement[] {
    if (this.userData) {
      return this.userData.slides[this.currentSlide].modules;
    }
    return [];
  }

  getCurrentBackgrounds(): SlideBackground[] {
    if (this.userData) {
      return this.userData.slides[this.currentSlide].backgrounds;
    }
    return [];
  }

  setSlide(i: number): void {
    this.currentSlide = i;
    this.stop();
    this.start();
    this.cdf.markForCheck();
  }

  ngOnDestory() {
    clearInterval(this.interval);
    clearInterval(this.carouselInterval);
  }

}

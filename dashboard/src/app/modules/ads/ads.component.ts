import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Ads, UserData } from 'src/data-types/userData';

@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdsComponent implements OnInit {
  @Input() ads?: Ads;
  background: string = "";
  urlSafe?: SafeResourceUrl;
  @Input() userData?: UserData;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (this.ads) {
      if (this.ads.url) {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.ads.url);
      }
      if (this.ads.background) {
        this.background = this.ads.background;
      }
    }
  }
}

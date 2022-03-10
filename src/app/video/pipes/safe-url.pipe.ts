import { Pipe, PipeTransform } from '@angular/core';
// Injectable service to bypass Angular sanitization
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeURL'
})
export class SafeURLPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ){}
  
  transform(value: string) {
    // Accepts a URL and returns an object called SafeURL. 
    // Angular will wrap the url with this object -> during rendering it will unwrap the value without sanitizing
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }

}

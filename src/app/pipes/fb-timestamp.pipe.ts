import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';
import  { DatePipe } from '@angular/common';

@Pipe({
  name: 'fbTimestamp'
})
export class FbTimestampPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: firebase.firestore.FieldValue) {
    // Have to create this custom pipe because we get a different time format from firebase -> cant apply date pipe directly
    const date = (value as firebase.firestore.Timestamp).toDate()
    return this.datePipe.transform(date, 'mediumDate');
  }

}
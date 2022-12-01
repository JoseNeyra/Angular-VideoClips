import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  inSubmission: boolean = false
  showAlert: boolean = false
  alertColor: string = 'blue'
  alertMsg: string = ''

  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  clipId: FormControl = new FormControl('', {
    nonNullable: true
  })

  title: FormControl = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  editForm: FormGroup = new FormGroup({
    title: this.title,
    id: this.clipId
  })

  constructor(private modalService: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {
    this.modalService.register('editClip')
  }

  // We need this method to check if the activeClip has been updated by the parent
  // In other words if the user has selected another clip
  ngOnChanges(changes: SimpleChanges): void {   
    // First check if the activeClip object is null
    if (!this.activeClip) {
      return
    } 

    // Turn off the alert
    this.inSubmission = false
    this.showAlert = false

    // Update the values as the user updates them
    this.clipId.setValue(this.activeClip.docID)
    this.title.setValue(this.activeClip.title)
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClip')
  }

  async submit() {

    // Return if the activeClip object is null
    if (!this.activeClip) { 
      return
    }

    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Updating clip.'

    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value)
    } catch (error) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Something went wrong. Try again later'
      return
    }

    // Update the activeClip title to new value entered in the control
    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)   // Emitting an event with the activeClip object
    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Success!'
  }
}

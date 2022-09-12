import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [] 

  constructor() { }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    })
  }

  unregister(id: string) {
    this.modals = this.modals.filter(
      element => element.id != id 
    )
  }

  isModalVisible(id: string) : boolean{
    return !!this.modals.find(element => element.id === id)?.visible  // Need ? (optional chaining) because this may return an undefined, need double negation to convert undefined returns to boolean 
  }

  toggleModal(id: string) {
    const modal = this.modals.find(element => element.id === id)
    
    if (modal) {
      modal.visible = !modal.visible
    }
  }
}

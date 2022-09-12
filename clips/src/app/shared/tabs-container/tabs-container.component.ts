import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css']
})
export class TabsContainerComponent implements AfterContentInit {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> = new QueryList()
  // @ContentChildren(TabComponent) tabs?: QueryList<TabComponent>   ->   Another way of declaring this type by making it optional

  constructor() { }

  // ngOnInit(): void {           // Projected content through ng-content is still not initialized at ngOnInit
  //   console.log(this.tabs)
  // }

  ngAfterContentInit(): void {      // Projected content through ng-content is initialized after content init
    // Get all active tabs
    const activeTabs = this.tabs?.filter(
      tab => tab.active
    )

    // Check if the active tabs array is empty, if it's not empty then make only one active
    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs!.first)        // Use the bang operator to tell the compiler that this is always going to be initialized
    }
  }

  selectTab(tab: TabComponent): boolean{
    this.tabs?.forEach(tab => {
      tab.active = false
    })

    tab.active = true

    return false          // Returning false is another way of preventing the default behaviour
  }
}

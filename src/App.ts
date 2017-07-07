import { w, v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin } from '@dojo/widget-core/mixins/Themeable';

import * as css from './styles/app.m.css';

export interface AccordionTitleProperties { active: boolean; }
export interface AccordionPanelProperties {
  id: string;
  exclusive: boolean;
	onChange: (id: string, e?: any) => void;
  active: boolean;
}
export interface AccordionProperties {
  exclusive: boolean;
	onChange: (id: string, e?: any) => void;

  panels: any;
}

const Base = ThemeableMixin(WidgetBase);

@theme(css)
export class AccordionTitle extends Base<AccordionTitleProperties> {
  protected render(): DNode {
    const { active } = this.properties;
    return v('span', [
      v('label', {for: 'close_g_id'}),
      v('h5', {
        classes: this.classes(css.button, active ? css.active : null)
      }, this.children)
    ])
  }
}

export class AccordionPanel extends Base<AccordionPanelProperties> {
    private _onChange(event: MouseEvent) {
      this.properties.onChange(this.properties.id, event);
    }
    protected render(): DNode {
        const { id, active, exclusive } = this.properties;
        return v('label', [
          v('input', {
            type: !!exclusive ? 'radio' : 'checkbox',
            name: '_g_id',
            onchange: this._onChange
          }),
          w(AccordionTitle, {active}, [id + ' What is a dog?'])
        ]);
    }
}

export class Accordion extends WidgetBase<AccordionProperties> {
  private _activeIds: string[] = [];

  private _onAccordionPanelChanged(id: string, e: any): void {
    console.log('changed', id, e, e.target.checked)
    const { exclusive } = this.properties;
    if (exclusive) { this._activeIds = [] }
    if (e.target.checked) {
      this._activeIds.push(id)
    } else if (!exclusive) {
      const pos = this._activeIds.indexOf(id);
      pos > -1 && this._activeIds.splice(pos, 1);
    }
    this.invalidate();
  }
  private _onAccordionPanelsClosed() {
    this._activeIds = [];
    this.invalidate();
  }
  protected render(): DNode {
    const { exclusive, panels = [] } = this.properties;
    const children: DNode[] = panels.map((o: any) => {
      const id = o.title;
      return w(AccordionPanel, {
        id, exclusive,
        key: id,
        active: (this._activeIds.indexOf(id) > -1),
        onChange: this._onAccordionPanelChanged
      });
    });

    if (!!exclusive) {
      children.push( v('input', {
        type: 'radio',
        name:'_g_id',
        id:'close_g_id',
        onchange: this._onAccordionPanelsClosed
      }) )
    }
    return v('fieldset', children);
  }
}

export class App extends WidgetBase<WidgetProperties> {

  protected render(): DNode {
    return w(Accordion, {
    	exclusive: false,
    //				icon: true,
    //				styled: true,
    	onChange: (id: string, e: Event) => { console.log(id, e) },
    	panels: [
    		{title: 'title', meta: 'meta', content: 'Lorem Ipsum', active: true},
    		{title: 'title2', meta: 'meta2', content: 'Lorem Ipsum dolor sunt'}
    	]
    });
  }
}

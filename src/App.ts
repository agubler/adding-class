import { mixin } from '@dojo/core/lang';
import { w, v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { WidgetBase, beforeRender } from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin } from '@dojo/widget-core/mixins/Themeable';

import * as css from './styles/app.m.css';

export interface AccordionTitleProperties { active: boolean; }
export interface AccordionPanelProperties {
  id: string;
  active: boolean;
  exclusive: boolean;
	onChange: (evt: any) => void;
}
export interface AccordionProperties {
  panels: any;
  exclusive: boolean;
	onChange: (evt: any) => void;
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
    get id() { return this.properties.id }

    private _onChange(event: MouseEvent) {
      this.properties.onChange(mixin({}, event, {widget: this}))
    }
    protected render(): DNode {
        const { id, active, exclusive } = this.properties;
        return v('label', [
          v('input', {
            checked: active,
            type: !!exclusive ? 'radio' : 'checkbox',
            name: '_g_id',
            onchange: this._onChange
          }),
          w(AccordionTitle, {active}, [id])
        ]);
    }
}

export class Accordion extends WidgetBase<AccordionProperties> {

  static Panel = AccordionPanel;
  //static Content = AccordionContent;
  static Title = AccordionTitle;
  //static Meta = AccordionMeta;

   _activeIds: string[] = [];

  private _onAccordionPanelChanged(e: any): void {
    console.log('changed', e, e.target.checked, e.widget.id)
    const { exclusive } = this.properties;
    if (exclusive) { this._activeIds = [] }
    if (e.target.checked && this._activeIds.indexOf(e.widget.id) < 0) {
      this._activeIds.push(e.widget.id)
    } else if (!e.target.checked && !exclusive) {
      console.log('before remove', this._activeIds)
      const pos = this._activeIds.indexOf(e.widget.id);
      if (pos > -1) {
        this._activeIds.splice(pos, 1);
      }
    }
    this.invalidate();
    if (!e.target.checked && !exclusive) {console.log('remove', this._activeIds);}
  }
  private _onAccordionPanelsClosed() {
    this._activeIds = [];
    this.invalidate();
  }

  render(): DNode {
    const { exclusive, panels = [] } = this.properties;

    let children: DNode[] = panels.map((o: any) => {
      const id = o.title;

/*  // TODO FIXME - HOW CAN I SET THE INITIAL STATE FOR AN ACTIVE PANEL ???
      if (o.active && this._activeIds.indexOf(id) < 0) {
        if (exclusive) { this._activeIds = [] }
        this._activeIds.push(id);
      }
*/
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

  protected render(): DNode[] {
    return [
      v('span',['Accordion logic for "exclusive: false"']),
      w(Accordion, {
      	exclusive: false, /* icon: true, styled: true, etc. */
      	onChange: (evt: Event) => { console.log(evt) },
      	panels: [
      		{title: 'title', meta: 'meta', content: 'Lorem Ipsum', active: true},
      		{title: 'title2', meta: 'meta2', content: 'Lorem Ipsum dolor sunt'}
      	]
      }),

      v('span',['Accordion logic for "exclusive: true" (last radio = close all stub)']),
      w(Accordion, {
      	exclusive: true,
      	onChange: (evt: Event) => { console.log(evt) },
      	panels: [
      		{title: 'title', meta: 'meta', content: 'Lorem Ipsum', active: true},
      		{title: 'title2', meta: 'meta2', content: 'Lorem Ipsum dolor sunt'}
      	]
      })

    ];
  }
}

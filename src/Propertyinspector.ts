import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings, Settings } from './Settings';

const pi = new Streamdeck().propertyinspector();
let builder: FormBuilder<Settings> | undefined;

pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid)); // trigger the didReceiveSettings event

pi.on('didReceiveSettings', ({ settings }) => {
  if (builder === undefined) {
    const initialData: Settings = isSettings(settings) ? settings : { background: 'orange', number: '0' };
    builder = new FormBuilder<Settings>(initialData);
    const numbers = builder.createDropdown().setLabel('Change Value');
    for (const [index] of Array.from({ length: 10 }).entries()) {
      numbers.addOption(String(index), String(index));
    }
    builder.addElement('number', numbers);
    builder.addElement(
      'background',
      builder
        .createDropdown()
        .setLabel('Server Region')
        .addOption('EU', 'eu')
        .addOption('NA', 'na')
        .addOption('', ''),
    );
    builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);
    builder.on('change-settings', () => {
      if (pi.pluginUUID === undefined) {
        console.error('pi has no uuid! is it registered already?', pi.pluginUUID);
        return;
      }
      pi.setSettings(pi.pluginUUID, builder?.getFormData());
    });
  } else if (isSettings(settings)) {
    builder.setFormData(settings);
  }
});

export default pi;
import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings } from './Settings';

const plugin = new Streamdeck().plugin();
const server: Record<string, string> = {};
const dataTables = {
  'eu': { //The region
    'monday': { //The day, with all times in UTC
      '22:15': 'Kutum/Karanda',
      '00:00': 'Karanda',
      '03:00': 'Kzarka',
      '07:00': 'Kzarka',
      '10:00': 'Offin',
      '14:00': 'Kutum',
      '17:00': 'Nouver',
      '20:15': 'Kzarka',
      '21:15': 'None',
    },
    'tuesday': {
      '22:15': 'Karanda',
      '00:00': 'Kutum',
      '03:00': 'Kzarka',
      '07:00': 'Nouver',
      '10:00': 'Kutum',
      '14:00': 'Nouver',
      '17:00': 'Karanda',
      '20:15': 'Garmoth',
      '21:15': 'None',
    },
    'wednesday': {
      '22:15': 'Kzarka/Kutum',
      '00:00': 'Karanda',
      '03:00': 'Kzarka',
      '07:00': 'Karanda',
      '10:00': 'None',
      '14:00': 'Kutum/Offin',
      '17:00': 'Vell',
      '20:15': 'Kzarka/Karanda',
      '21:15': 'Quint/Muraka',
    },
    'thursday': {
      '22:15': 'Nouver',
      '00:00': 'Kutum',
      '03:00': 'Nouver',
      '07:00': 'Kutum',
      '10:00': 'Nouver',
      '14:00': 'Kzarka',
      '17:00': 'Kutum',
      '20:15': 'Garmoth',
      '21:15': 'None',
    },
    'friday': {
      '22:15': 'Kzarka/Karanda',
      '00:00': 'Nouver',
      '03:00': 'Karanda',
      '07:00': 'Kutum',
      '10:00': 'Karanda',
      '14:00': 'Nouver',
      '17:00': 'Kzarka',
      '20:15': 'Kzarka/Kutum',
      '21:15': 'None',
    },
    'saturday': {
      '22:15': 'Karanda',
      '00:00': 'Offin',
      '03:00': 'Nouver',
      '07:00': 'Kutum',
      '10:00': 'Nouver',
      '14:00': 'Quint/Muraka',
      '17:00': 'Kzarka/Karanda',
      '20:15': 'None',
      '21:15': 'None',
    },
    'sunday': {
      '22:15': 'Nouver/Kutum',
      '00:00': 'Kzarka',
      '03:00': 'Kutum',
      '07:00': 'Nouver',
      '10:00': 'Kzarka',
      '14:00': 'Vell',
      '17:00': 'Garmoth',
      '20:15': 'Kzarka/Nouver',
      '21:15': 'None',
    },
  },
  'na': { //The region
    'monday': { //The day, with all times in UTC
      '16:00': '',
      '19:00': '',
      '23:00': '',
      '02:00': '',
      '06:00': '',
      '09:00': '',
      '12:15': '',
      '13:15': '',
      '14:15': '',
    }
  },
  'sa': { //The region
    'monday': { //The day, with all times in UTC
      '21:15': '',
      '23:00': '',
      '08:00': '',
      '13:00': '',
      '15:00': '',
      '17:00': '',
      '20:45': '',
    }
  },
  'ru': { //The region

  },
  'kr': { //The region

  },
  'jp': { //The region

  },
  'sea': { //The region

  },
  'mena': { //The region

  },
  'th': { //The region

  },
  'tw': { //The region

  },
}

function updateTitle(title: string, context: string): void {
  plugin.setTitle(String(title), context);
}

function changeBackground(server: string, context: string): void {
  const image = new Image();
  image.addEventListener('load', () => {
    const canvas = document.createElement('canvas');

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    canvas.getContext('2d')?.drawImage(image, 0, 0);
    plugin.setImage(canvas.toDataURL('image/png'), context);
  });
}

function updateSettings(context: string): void {
  plugin.setSettings(context, { region: String(numbers[context] || 'eu') });
}

plugin.on('willAppear', (event) => {
  plugin.getSettings(event.context);
});
plugin.on('didReceiveSettings', (event) => {
  if (isSettings(event.settings)) {
    changeNumber(Number(event.settings.number), event.context);
    changeBackground(event.settings.background, event.context);
  }
});
plugin.on('keyDown', (event) => {
  changeNumber(getNumber(event.context) + 1, event.context);
  updateSettings(event.context);
});

export default plugin;
 
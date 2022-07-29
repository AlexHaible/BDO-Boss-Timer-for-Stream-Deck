import { isSomething } from 'ts-type-guards';

export function isSettings(value: unknown): value is Settings {
  return (
    (value as Settings).hasOwnProperty('region')
    && isSomething((value as Settings).region)
  );
}

export type Settings = {
  region: string;
};

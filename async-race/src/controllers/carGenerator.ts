import { CarSettings } from "../components/setupForm";

const brands: string[] = [
  'Tesla', 'BMW', 'Ferrari', 'Lada', 'Nissan', 'Mitsubishi', 'Ford', 'Volkswagen', 'Toyota', 'Kia', 'Buick', 'RollsRoyse', 'Subaru',
  'Pegeot', 'Citroen', 'Fiat', 'Lamborghini', 'Mercedes', 'Shevrolet', 'UAZ'
];

const models: string[] = [
  'Kalina', 'Model S', 'Model T', 'Xsara', 'Granta', 'Z370', 'Patrol', 'Skyline', 'Celica', 'Corolla', 'X5', 'M3', 'Enzo', 'Spider',
  'Lancer', 'Lancer Evo X', 'Eclipse', 'Supra', 'Focus', 'Mustang', 'GT', 'Rio', 'Sportage', 'Accord', 'Continental', 'Polo',
  'Passat', 'Transit', 'Phantom', 'Spectre', 'Impreza', 'Forester', '307', '206', 'C9', 'Diablo', 'Countach', 'C-class', 'AMG',
  'Patriot', 'Buhanka', 'Niva', 'Cobalt SS', 'Itasha'
];

function selectRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function generateColor(): string {
  return `#${generateInt(255).toString(16)}${generateInt(255).toString(16)}${generateInt(255).toString(16)}`;
}

export default function generateCars(amount: number): CarSettings[] {
  return new Array(amount).fill(0).map(() => {
    return {
      name: `${selectRandom(brands)} ${selectRandom(models)}`,
      color: generateColor()
    }
  });
}
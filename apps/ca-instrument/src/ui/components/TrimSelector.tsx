import { activeMarket, selectedVehicleKey } from '@state/settings';

/** Segmented model toggle + trim chips driving the selected-trim focus. */
export function TrimSelector() {
  const vehicles = activeMarket.value.vehicles;
  const sel = selectedVehicleKey.value;
  const models = [...new Set(vehicles.map((v) => v.model))];
  const selModel = vehicles.find((v) => v.key === sel)?.model ?? models[0];

  return (
    <div class="trimsel">
      <div class="modelseg" role="tablist" aria-label="model">
        {models.map((m) => {
          const firstOfModel = vehicles.find((v) => v.model === m)!;
          return (
            <button
              class={selModel === m ? 'on' : ''}
              onClick={() => (selectedVehicleKey.value = firstOfModel.key)}
            >
              {m}
            </button>
          );
        })}
      </div>
      <div class="trimsel-trims" role="tablist" aria-label="trim">
        {vehicles
          .filter((v) => v.model === selModel)
          .map((v) => (
            <button
              class={`chip ${v.key === sel ? 'on' : ''}`}
              onClick={() => (selectedVehicleKey.value = v.key)}
            >
              {v.name.replace(v.model, '').trim() || v.name}
            </button>
          ))}
      </div>
    </div>
  );
}

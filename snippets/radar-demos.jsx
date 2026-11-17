// Live Radar Maps demos for the docs. Each one runs the Radar web SDK in the page
// with a publishable test key that is limited to these demos.

const RADAR_DEMO_KEY = 'org_test_pk_5857c63d9c1565175db8b00750808a66a002acb8';

const RADAR_DEMO_ASSETS = {
  css: [
    'https://js.radar.com/maps/v1.2.0/radar-maps.css',
    'https://js.radar.com/autocomplete/v1.2.0/radar-autocomplete.css',
  ],
  js: [
    'https://js.radar.com/v5.3.0/radar.min.js',
    'https://js.radar.com/maps/v1.2.0/radar-maps.min.js',
    'https://js.radar.com/autocomplete/v1.2.0/radar-autocomplete.min.js',
  ],
};

// Load the SDK and its plugins once per page view, in order.
const loadRadarDemoSdk = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.__radarDemoSdk) return window.__radarDemoSdk;

  RADAR_DEMO_ASSETS.css.forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(script);
    });

  window.__radarDemoSdk = RADAR_DEMO_ASSETS.js
    .reduce((chain, src) => chain.then(() => loadScript(src)), Promise.resolve())
    .then(() => {
      window.Radar.initialize(RADAR_DEMO_KEY);
      return window.Radar;
    })
    .catch((err) => {
      window.__radarDemoSdk = null;
      throw err;
    });

  return window.__radarDemoSdk;
};

const radarDemoIsDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

// A plain function, not a component: Mintlify only resolves exported components as JSX tags.
const radarDemoFrame = (label, error, children, caption) => (
  <div className="not-prose my-6 overflow-hidden rounded-xl border border-zinc-950/10 dark:border-white/10">
    <div className="flex items-center justify-between border-b border-zinc-950/10 px-4 py-2 text-xs text-zinc-950/60 dark:border-white/10 dark:text-white/60">
      <span>{label}</span>
      <span>Live demo</span>
    </div>
    {error ? (
      <div className="px-4 py-6 text-sm text-zinc-950/70 dark:text-white/70">
        The demo could not load. Check your connection and reload the page.
      </div>
    ) : (
      children
    )}
    {caption ? (
      <div className="border-t border-zinc-950/10 px-4 py-2 text-xs text-zinc-950/60 dark:border-white/10 dark:text-white/60">
        {caption}
      </div>
    ) : null}
  </div>
);

// A map with one marker.
export const RadarMapDemo = ({
  center = [-73.9905, 40.7359],
  zoom = 14,
  markerText = 'Union Square',
  height = 400,
  label = 'Radar.ui.map()',
}) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let map;
    let cancelled = false;
    loadRadarDemoSdk()
      .then((Radar) => {
        if (cancelled || !containerRef.current) return;
        map = Radar.ui.map({
          container: containerRef.current,
          style: radarDemoIsDark() ? 'radar-dark-v1' : 'radar-default-v1',
          center,
          zoom,
        });
        Radar.ui.marker({ popup: { text: markerText } }).setLngLat(center).addTo(map);
      })
      .catch(() => setError(true));
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, []);

  return radarDemoFrame(
    label,
    error,
    <>
      <div ref={containerRef} style={{ width: '100%', height }} />
    </>
  );
};

// An address field with autocomplete. Shows the fields of the selected address.
export const RadarAutocompleteDemo = ({
  placeholder = 'Start typing your address',
  label = 'Radar.ui.autocomplete()',
}) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    let autocomplete;
    let cancelled = false;
    loadRadarDemoSdk()
      .then((Radar) => {
        if (cancelled || !containerRef.current) return;
        autocomplete = Radar.ui.autocomplete({
          container: containerRef.current,
          width: '100%',
          layers: ['address'],
          countryCode: 'US',
          placeholder,
          ariaLabel: 'Find your address',
          responsive: true,
          onSelection: (selected) => setAddress(selected),
        });
      })
      .catch(() => setError(true));
    return () => {
      cancelled = true;
      if (autocomplete && autocomplete.remove) autocomplete.remove();
    };
  }, []);

  const fields = address
    ? [
        ['formattedAddress', address.formattedAddress],
        ['number', address.number],
        ['street', address.street],
        ['unit', address.unit],
        ['city', address.city],
        ['stateCode', address.stateCode],
        ['postalCode', address.postalCode],
        ['countryCode', address.countryCode],
        ['latitude', address.latitude],
        ['longitude', address.longitude],
      ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    : [];

  return radarDemoFrame(
    label,
    error,
    <>
      <div className="p-4" style={{ minHeight: 120 }}>
        <div ref={containerRef} />
        {address ? (
          <dl className="mt-4 grid gap-x-4 gap-y-1 text-sm" style={{ gridTemplateColumns: 'max-content 1fr' }}>
            {fields.map(([name, value]) => (
              <div key={name} style={{ display: 'contents' }}>
                <dt className="font-mono text-xs text-zinc-950/60 dark:text-white/60">{name}</dt>
                <dd className="text-zinc-950 dark:text-white">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-zinc-950/60 dark:text-white/60">
            Select a suggestion to see the fields Radar returns.
          </p>
        )}
      </div>
    </>
  );
};

// A minimal locator: search for an address, then show nearby places on a map and in a list.
export const RadarStoreLocatorDemo = ({
  center = [-73.9905, 40.7359],
  zoom = 13,
  categories = 'cafe',
  height = 360,
  label = 'Radar.ui.autocomplete() + Radar.ui.map()',
  caption = 'This demo searches Radar Places for cafes. Your locator searches your own locations with Radar.searchGeofences().',
}) => {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const [error, setError] = useState(false);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('Loading nearby places');

  useEffect(() => {
    let map;
    let autocomplete;
    let markers = [];
    let cancelled = false;

    const search = (Radar, lngLat) => {
      setStatus('Searching');
      Radar.searchPlaces({
        near: { latitude: lngLat[1], longitude: lngLat[0] },
        radius: 2000,
        categories: [categories],
        limit: 8,
      })
        .then((result) => {
          if (cancelled) return;
          markers.forEach((marker) => marker.remove());
          const found = result.places || [];
          markers = found.map((place) =>
            Radar.ui
              .marker({ popup: { text: place.name } })
              .setLngLat(place.location.coordinates)
              .addTo(map)
          );
          setPlaces(found);
          setStatus(found.length ? '' : 'No places found near this address');
        })
        .catch(() => {
          if (!cancelled) setStatus('The search failed. Try another address.');
        });
    };

    loadRadarDemoSdk()
      .then((Radar) => {
        if (cancelled || !mapRef.current || !inputRef.current) return;
        map = Radar.ui.map({
          container: mapRef.current,
          style: radarDemoIsDark() ? 'radar-dark-v1' : 'radar-default-v1',
          center,
          zoom,
        });
        autocomplete = Radar.ui.autocomplete({
          container: inputRef.current,
          width: '100%',
          placeholder: 'Address, city, or postal code',
          responsive: true,
          onSelection: (selected) => {
            const lngLat = [selected.longitude, selected.latitude];
            map.flyTo({ center: lngLat, zoom });
            search(Radar, lngLat);
          },
        });
        search(Radar, center);
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
      if (autocomplete && autocomplete.remove) autocomplete.remove();
      if (map) map.remove();
    };
  }, []);

  return radarDemoFrame(
    label,
    error,
    <>
      <div className="p-4">
        <div ref={inputRef} />
      </div>
      <div ref={mapRef} style={{ width: '100%', height }} />
      <div className="px-4 py-3 text-sm">
        {status ? (
          <p className="text-zinc-950/60 dark:text-white/60">{status}</p>
        ) : (
          <ul className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {places.map((place) => (
              <li key={place._id} className="truncate text-zinc-950 dark:text-white">
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>,
    caption
  );
};

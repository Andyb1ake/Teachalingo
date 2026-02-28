// Paste this in your app to load the auto-updated data

function useAutoUpdatedData(file: 'math' | 'science' | 'roleplays') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO_NAME/main/public/data/${file}.json`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        setData(json);
        console.log(`Loaded ${file}:`, json);
      })
      .catch(err => console.error('Auto-update fetch failed:', err))
      .finally(() => setLoading(false));
  }, [file]);

  return { data, loading };
}

// Example usage in your component:
const { data: mathData, loading: mathLoading } = useAutoUpdatedData('math');
if (mathLoading) return <p>Loading latest math units...</p>;
console.log('Latest math sections:', mathData?.sections?.length);

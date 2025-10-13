interface TicketmasterEvent {
  id: string;
  name: string;
  info?: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  classifications?: Array<{
    segment: {
      name: string;
    };
    genre?: {
      name: string;
    };
    subGenre?: {
      name: string;
    };
  }>;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  _embedded?: {
    venues: Array<{
      name: string;
      city: {
        name: string;
      };
      state: {
        stateCode: string;
      };
    }>;
  };
  url: string;
  priceRanges?: Array<{
    min: number;
    max: number;
  }>;
}

// Map Ticketmaster segments/genres to our categories
function mapToCategory(classification: any): string {
  const segment = classification?.segment?.name?.toLowerCase() || '';
  const genre = classification?.genre?.name?.toLowerCase() || '';
  const subGenre = classification?.subGenre?.name?.toLowerCase() || '';

  // Music
  if (segment === 'music' || genre.includes('music')) {
    return 'Music';
  }

  // Arts & Culture
  if (
    segment === 'arts' ||
    genre.includes('art') ||
    genre.includes('visual arts') ||
    genre.includes('museums') ||
    genre.includes('dance') ||
    subGenre.includes('ballet')
  ) {
    return 'Arts & Culture';
  }

  // Theater
  if (
    segment === 'arts & theatre' ||
    genre.includes('theatre') ||
    genre.includes('theater') ||
    subGenre.includes('musical') ||
    subGenre.includes('play')
  ) {
    return 'Theater';
  }

  // Comedy
  if (genre.includes('comedy')) {
    return 'Comedy';
  }

  // Sports
  if (segment === 'sports') {
    return 'Sports';
  }

  // Family & Kids
  if (
    genre.includes('family') ||
    genre.includes('children') ||
    subGenre.includes('kids')
  ) {
    return 'Family & Kids';
  }

  // Festivals
  if (
    genre.includes('festival') ||
    subGenre.includes('festival')
  ) {
    return 'Festivals';
  }

  // Fashion (runway shows, fashion events)
  if (genre.includes('fashion')) {
    return 'Fashion';
  }

  // Business & Tech
  if (
    genre.includes('business') ||
    genre.includes('conference') ||
    subGenre.includes('tech')
  ) {
    return 'Business';
  }

  // Default
  return 'General';
}

export async function fetchTicketmasterEvents(city: string = 'New Orleans') {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    console.error('Ticketmaster API key not configured');
    return [];
  }

  try {
    console.log('🔍 Fetching diverse Ticketmaster events...');

    // Fetch events across ALL segments for diversity
    const segments = ['Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous'];
    const allEvents: TicketmasterEvent[] = [];
    const eventIds = new Set(); // Prevent duplicates

    for (const segment of segments) {
      try {
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?` +
          `city=${encodeURIComponent(city)}&` +
          `segmentName=${encodeURIComponent(segment)}&` +
          `apikey=${apiKey}&` +
          `size=20&` +
          `sort=date,asc`,
          { cache: 'no-store' } // Prevent caching for fresh data
        );

        if (response.ok) {
          const data = await response.json();
          if (data._embedded?.events) {
            // Filter out duplicates
            const newEvents = data._embedded.events.filter(
              (event: TicketmasterEvent) => {
                if (eventIds.has(event.id)) return false;
                eventIds.add(event.id);
                return true;
              }
            );
            allEvents.push(...newEvents);
          }
        } else {
          console.log(`⚠️ Ticketmaster ${segment} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ Error fetching ${segment} events:`, error);
      }
    }

    if (allEvents.length === 0) {
      console.log('ℹ️ No Ticketmaster events found');
      return [];
    }

    console.log(`✅ Found ${allEvents.length} diverse Ticketmaster events`);

    return allEvents.map((event: TicketmasterEvent) => {
      const venue = event._embedded?.venues?.[0];
      const location = venue
        ? `${venue.name}, ${venue.city.name}, ${venue.state.stateCode}`
        : city;

      // Get the best quality image (prefer 16:9 ratio, at least 640px wide)
      const image =
        event.images?.find((img) => img.width >= 1024)?.url ||
        event.images?.find((img) => img.width >= 640)?.url ||
        event.images?.[0]?.url;

      // Get category
      const classification = event.classifications?.[0];
      const category = mapToCategory(classification);

      // Get description
      const segment = classification?.segment?.name || 'Event';
      const genre = classification?.genre?.name || '';
      const subGenre = classification?.subGenre?.name || '';
      
      let description = event.info || '';
      if (!description) {
        description = `${segment}${genre ? ` - ${genre}` : ''}${subGenre ? ` (${subGenre})` : ''} in New Orleans`;
      }

      // Get price info
      const priceRange = event.priceRanges?.[0];
      const priceInfo = priceRange
        ? `$${priceRange.min} - $${priceRange.max}`
        : undefined;

      return {
        title: event.name,
        description,
        date: new Date(event.dates.start.localDate),
        time: event.dates.start.localTime,
        location,
        imageUrl: image,
        sourceUrl: event.url,
        externalId: event.id,
        source: 'ticketmaster',
        category,
        priceInfo,
        // Store original classification for reference
        metadata: {
          segment: segment,
          genre: genre,
          subGenre: subGenre,
        },
      };
    });
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error);
    return [];
  }
}
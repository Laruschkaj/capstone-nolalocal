interface EventbriteVenue {
  name: string;
  address: {
    city: string;
    region: string;
  };
}

interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description: {
    text: string;
  };
  start: {
    local: string;
    timezone: string;
  };
  venue?: EventbriteVenue;
  url: string;
}

export async function fetchEventbriteEvents() {
  const apiKey = process.env.EVENTBRITE_API_KEY;

  if (!apiKey) {
    console.log('⚠️ Eventbrite API key not configured - skipping Eventbrite sync');
    return [];
  }

  try {
    // Step 1: Get user's organization ID
    console.log('🔍 Fetching Eventbrite organization...');
    const orgResponse = await fetch(
      'https://www.eventbriteapi.com/v3/users/me/organizations/',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!orgResponse.ok) {
      console.log(`⚠️ Eventbrite org API returned ${orgResponse.status} - skipping`);
      return [];
    }

    const orgData = await orgResponse.json();
    
    if (!orgData.organizations || orgData.organizations.length === 0) {
      console.log('ℹ️ No Eventbrite organizations found - this is a personal account');
      // Try to search public events in New Orleans instead
      return await searchPublicEventbriteEvents(apiKey);
    }

    const organizationId = orgData.organizations[0].id;
    console.log(`✅ Found organization: ${organizationId}`);

    // Step 2: Get events from that organization
    const eventsResponse = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${organizationId}/events/?status=live&time_filter=current_future&expand=venue`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!eventsResponse.ok) {
      console.log(`⚠️ Eventbrite events API returned ${eventsResponse.status}`);
      return await searchPublicEventbriteEvents(apiKey);
    }

    const eventsData = await eventsResponse.json();

    if (!eventsData.events || eventsData.events.length === 0) {
      console.log('ℹ️ No live Eventbrite events found');
      return await searchPublicEventbriteEvents(apiKey);
    }

    console.log(`✅ Found ${eventsData.events.length} Eventbrite events from your organization`);

    return eventsData.events.slice(0, 20).map((event: EventbriteEvent) => ({
      title: event.name.text,
      description: event.description?.text || 'No description available',
      date: new Date(event.start.local),
      location: event.venue
        ? `${event.venue.name}, ${event.venue.address.city}, ${event.venue.address.region}`
        : 'New Orleans, LA',
      sourceUrl: event.url,
      externalId: event.id,
      source: 'eventbrite',
    }));
  } catch (error) {
    console.log('⚠️ Error fetching Eventbrite events:', error);
    return [];
  }
}

// Fallback: Search public events in New Orleans
async function searchPublicEventbriteEvents(apiKey: string) {
  try {
    console.log('🔍 Searching for public Eventbrite events in New Orleans...');
    
    // Note: Public event search requires different permissions
    // For now, just return empty array with a helpful message
    console.log('ℹ️ Public event search requires additional API permissions');
    console.log('ℹ️ To see Eventbrite events, create events in your Eventbrite account');
    
    return [];
  } catch (error) {
    console.log('⚠️ Could not search public events');
    return [];
  }
}
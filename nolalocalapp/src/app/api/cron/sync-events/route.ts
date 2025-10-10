import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event, Category } from '@/models';
import { fetchEventbriteEvents } from '@/lib/services/eventbrite';
import { fetchTicketmasterEvents } from '@/lib/services/ticketmaster';
import { successResponse } from '@/lib/helpers/apiResponse';

// This runs automatically via Vercel Cron (when deployed)
// For now, you can trigger it manually or set up a local cron job
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting automatic event sync...');
    await dbConnect();

    // Get or create default category
    let defaultCategory = await Category.findOne({ slug: 'general' });
    
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'General',
        slug: 'general',
        color: '#6B7280',
      });
    }

    // Fetch from both APIs
    const [eventbriteEvents, ticketmasterEvents] = await Promise.all([
      fetchEventbriteEvents(),
      fetchTicketmasterEvents('New Orleans'),
    ]);

    const allExternalEvents = [...eventbriteEvents, ...ticketmasterEvents];

    let newCount = 0;
    let updatedCount = 0;

    // Process each external event
    for (const externalEvent of allExternalEvents) {
      const existing = await Event.findOne({
        externalId: externalEvent.externalId,
        source: externalEvent.source,
      });

      if (existing) {
        existing.title = externalEvent.title;
        existing.description = externalEvent.description;
        existing.date = externalEvent.date;
        existing.time = externalEvent.time;
        existing.location = externalEvent.location;
        existing.sourceUrl = externalEvent.sourceUrl;
        existing.lastSyncedAt = new Date();
        await existing.save();
        updatedCount++;
      } else {
        await Event.create({
          ...externalEvent,
          category: defaultCategory._id,
          lastSyncedAt: new Date(),
        });
        newCount++;
      }
    }

    console.log(`✅ Sync complete: ${newCount} new, ${updatedCount} updated`);

    return successResponse(
      {
        newEvents: newCount,
        updatedEvents: updatedCount,
        totalProcessed: allExternalEvents.length,
      },
      `Auto-sync complete: ${newCount} new events, ${updatedCount} updated`
    );
  } catch (error: any) {
    console.error('❌ Auto-sync error:', error);
    return successResponse(
      { error: error.message },
      'Sync completed with errors',
      200 // Return 200 so cron doesn't retry
    );
  }
}
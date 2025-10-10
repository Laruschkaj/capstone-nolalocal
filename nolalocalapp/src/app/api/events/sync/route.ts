import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event, Category } from '@/models';
import { fetchEventbriteEvents } from '@/lib/services/eventbrite';
import { fetchTicketmasterEvents } from '@/lib/services/ticketmaster';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get a default category (or create one)
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
    let skippedCount = 0;

    // Process each external event
    for (const externalEvent of allExternalEvents) {
      try {
        // Find matching category or use default
        const category = await Category.findOne({ 
          name: externalEvent.category 
        }) || defaultCategory;

        // Truncate description to 2000 characters
        const description = externalEvent.description?.length > 2000
          ? externalEvent.description.substring(0, 1997) + '...'
          : externalEvent.description;

        const existing = await Event.findOne({
          externalId: externalEvent.externalId,
          source: externalEvent.source,
        });

        if (existing) {
          // Update existing event
          existing.title = externalEvent.title;
          existing.description = description;
          existing.date = externalEvent.date;
          existing.time = externalEvent.time;
          existing.location = externalEvent.location;
          existing.sourceUrl = externalEvent.sourceUrl;
          existing.imageUrl = externalEvent.imageUrl;
          existing.category = category._id as any;
          existing.lastSyncedAt = new Date();
          await existing.save();
          updatedCount++;
        } else {
          // Create new event
          await Event.create({
            title: externalEvent.title,
            description: description,
            date: externalEvent.date,
            time: externalEvent.time,
            location: externalEvent.location,
            sourceUrl: externalEvent.sourceUrl,
            imageUrl: externalEvent.imageUrl,
            externalId: externalEvent.externalId,
            source: externalEvent.source,
            category: category._id as any,
            lastSyncedAt: new Date(),
          });
          newCount++;
        }
      } catch (eventError: any) {
        console.error(`Error processing event ${externalEvent.title}:`, eventError.message);
        skippedCount++;
      }
    }

    return successResponse(
      {
        newEvents: newCount,
        updatedEvents: updatedCount,
        skippedEvents: skippedCount,
        totalProcessed: allExternalEvents.length,
      },
      `Synced ${newCount} new events, updated ${updatedCount} events${skippedCount > 0 ? `, skipped ${skippedCount}` : ''}`
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return errorResponse('Server error during sync', 500);
  }
}
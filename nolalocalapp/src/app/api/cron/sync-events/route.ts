import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event, Category } from '@/models';
import { fetchEventbriteEvents } from '@/lib/services/eventbrite';
import { fetchTicketmasterEvents } from '@/lib/services/ticketmaster';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

export async function GET(request: NextRequest) {
  try {
    // Security: Verify this is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Unauthorized cron attempt');
      return errorResponse('Unauthorized', 401);
    }

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
    let skippedCount = 0;

    // Process each external event
    for (const externalEvent of allExternalEvents) {
      try {
        // Find matching category
        const category = await Category.findOne({ 
          name: externalEvent.category 
        }) || defaultCategory;

        // Truncate long descriptions
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
        console.error(`Error processing event: ${eventError.message}`);
        skippedCount++;
      }
    }

    const message = `✅ Sync complete: ${newCount} new, ${updatedCount} updated, ${skippedCount} skipped`;
    console.log(message);

    return successResponse(
      {
        newEvents: newCount,
        updatedEvents: updatedCount,
        skippedEvents: skippedCount,
        totalProcessed: allExternalEvents.length,
        timestamp: new Date().toISOString(),
      },
      message
    );
  } catch (error: any) {
    console.error('❌ Auto-sync error:', error);
    return errorResponse('Sync failed: ' + error.message, 500);
  }
}
/**
 * Event Logic Script
 * ALL event transactions go in this file
 */

const ENS = 'org.madducks.wizticket.events'
const TNS = 'org.madducks.wizticket.tickets'
const PNS = 'org.madducks.wizticket.participants'

/**
* Create a new event and produce the required amount of tickets
* @param {org.madducks.wizticket.events.postEvent} eventdata - The data to be processed
* @transaction
*/

async function postEvent(eventdata){
  console.log("##### POST EVENT TX HAPPENING #####")
  
  /* Invoke the transaction factory */
  const factory = getFactory();
  
  /* Create a new event element */
  var event = factory.newResource(ENS,'EventHappening',uuidv4())
  
  /* Fill al data in */
  event.name = eventdata.name
  event.description = eventdata.description
  event.artists = eventdata.artists
  event.eventDate = eventdata.eventDate
  
  /* Assign its owner */
  event.owner = factory.newRelationship(PNS,'Artist',eventdata.owner.getIdentifier())
  event.space = factory.newRelationship(ENS,'EventSpace',eventdata.space.getIdentifier())
  
  /* Store new Event */
  const registry = await getAssetRegistry(event.getFullyQualifiedType())
  await registry.add(event)
  
  /* We create all the tickets */
  const CATS = ["PLATINUM","GOLD","SILVER","BRONCE"]
  
  /* We retrieve the EventSpace with a query */
  const spaceRegistry = await getAssetRegistry(ENS+'.EventSpace')
  const espace = await spaceRegistry.get(eventdata.space.getIdentifier())
  var seats = espace.seating
  
  /* We get the overall configuration */
  var pricing = eventdata.pricing
  
  /* We loop to create the tickets */
  for(var x=0; x < seats.length; x++) {
    for(var i = 0; i < seats[x]; i++){
      var ticket = factory.newResource(TNS,'Ticket',uuidv4())
      ticket.status = "RELEASED"
      ticket.seat = i+1
      ticket.category = CATS[x]
      ticket.cost = pricing[x]
      ticket.event = factory.newRelationship(ENS,'EventHappening',event.getIdentifier())
      
      /* Store new Event */
      const registry = await getAssetRegistry(ticket.getFullyQualifiedType())
      await registry.add(ticket)
    }
  } 
}



/**
* Create an RFC4122 Compliant UUIDv4 for IDs
*/
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
* Change a ticket's ownership
* @param {org.madducks.wizticket.tickets.buyTicket} ticketdata
* @transaction
*/

async function buyTicket(ticketdata){
    console.log(' ##### Buy Ticket ##### ')
    
    /* Set the new ticket's owner*/
    ticketdata.ticket.owner = ticketdata.owner
    
    /* Change ticket status */
    ticketdata.ticket.status = ticketdata.status
    
    /* Save it to the ledger */
    const assetRegistry = await getAssetRegistry('org.madducks.wizticket.tickets.Ticket')
    await assetRegistry.update(ticketdata.ticket)
  }
  
  /**
  * Change a ticket's ownership (F2F)
  * @param {org.madducks.wizticket.tickets.resellTicket} ticketdata
  * @transaction
  */
  
  async function resellTicket(ticketdata){
    console.log(' ##### Resell Tickets ##### ')
    
    /* Check if pricing is fair */
    if (ticketdata.cost > ticketdata.ticket.cost) {
          throw new error("Reselling price can't be higher than the original cost")
    }
    
    /* Set the new ticket's owner*/
    ticketdata.ticket.owner = ticketdata.newOwner
    
    /* Change ticket status */
    ticketdata.ticket.status = "RESOLD"
    
    /* Save it to the ledger */
    const assetRegistry = await getAssetRegistry('org.madducks.wizticket.tickets.Ticket')
    await assetRegistry.update(ticketdata.ticket)
  }
  
  /**
  * Change a ticket's ownership (F2F)
  * @param {org.madducks.wizticket.tickets.useTicket} ticketdata
  * @transaction
  */
  
  async function useTicket(useTicket){
    console.log(' ##### Use Ticket ##### ')
    
    /* Change ticket status */
    ticketdata.ticket.status = "USED"
    
    /* Save it to the ledger */
    const assetRegistry = await getAssetRegistry('org.madducks.wizticket.tickets.Ticket')
    await assetRegistry.update(ticketdata.ticket)
  }
const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

/* wizticket's namespace */
const namespace = 'org.madducks.wizticket'

/* in memory card store for testing */
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({
    type: 'composer-wallet-inmemory'
})

/* Admin connection */
let adminConnection

/* Business network connection */
let businessNetworkConnection
let businessNetworkName = 'wizticket'
let factory

/*
* Import card for an identity
* @param {String} cardName The card name to use for this identity
* @param {Object} identity, The identity details
*/

async function importCardForIdentity(cardName,identity){
    /* use admin connection */
    adminConnection = new AdminConnection()
    
    /* declare metadata */
    const metadata = {
        userName: identity.userID,
        version: 1,
        enrollmentSecret: identity.userSecret,
        businessNetwork: businessNetworkName
    }

    const connectionProfile = require('./local_connection.json')
    const card = new IdCard(metadata,connectionProfile)

    /* Import card */
    await adminConnection.importCard(cardName,card)
}

/*
* Reconnect using a different identity
* @param {String} cardName The identity to use
*/

async function useIdentity(cardName) {
    /* Disconnect from the current identity */
    await businessNetworkConnection.disconnect()

    /* Connect to network using cardName */
    businessNetworkConnection = new BusinessNetworkConnection()
    await businessNetworkConnection.connect(cardName)

}

/* Module exports */
module.exports = {
    /*
    * Create Fan participant and import card for identity
    * @param {String} fanId the Fan Id
    */

    registerFan: async function (fanId,firstName,lastName,email) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect('admin@wizticket')
            /* Create the factory */
            factory = businessNetworkConnection.getBusinessNetwork().getFactory()
            /* Create the new fan participant */
            const fan = factory.newResource(namespace+'.participants','Fan',fanId)
            const information = factory.newConcept(namespace+'.utilities','PersonalInformation')
            information.firstname = firstName
            information.lastname = lastName
            information.email = email
            fan.information = information
            /* Add fan participant */
            const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.Fan')
            await participantRegistry.add(fan)
            /* Issue identity */
            const identity = await businessNetworkConnection.issueIdentity(namespace+'.participants.Fan#'+fanId,fanId)
            /* Import card for identity */
            await importCardForIdentity(fanId,identity)
            /* Disconnect */
            await businessNetworkConnection.disconnect('admin@wizticket')
            /* Success */
            return true
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    /* 
    * Create an Artist participant and import card for identity
    * @param {String} artistId 
    */

    registerArtist: async function (artistId,firstName,lastName,email) {
        try{
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect('admin@wizticket')
            /* Create the factory */
            factory = businessNetworkConnection.getBusinessNetwork().getFactory()
            /* Create the artist participant */
            const artist = factory.newResource(namespace+'.participants','Artist',artistId)
            const information = factory.newConcept(namespace+'.utilities','PersonalInformation')
            information.firstname = firstName
            information.lastname = lastName
            information.email = email
            artist.information = information
            const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.Artist')
            await participantRegistry.add(artist)
            /* Add artist participant */
            const identity = await businessNetworkConnection.issueIdentity(namespace+'.participants.Artist#'+artistId,artistId)
            /* Import card for identity */
            await importCardForIdentity(artistId,identity)
            /* Disconnect */
            await businessNetworkConnection.disconnect('admin@wizticket')
            /* Success */
            return true
        } catch(err){
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    registerOwner: async function (ESId,firstName,lastName,email) {
        try{
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect('admin@wizticket')
            /* Create the factory */
            factory = businessNetworkConnection.getBusinessNetwork().getFactory()
            /* Create the artist participant */
            const artist = factory.newResource(namespace+'.participants','EventSpaceOwner',ESId)
            const information = factory.newConcept(namespace+'.utilities','PersonalInformation')
            information.firstname = firstName
            information.lastname = lastName
            information.email = email
            artist.information = information
            const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.EventSpaceOwner')
            await participantRegistry.add(artist)
            /* Add artist participant */
            const identity = await businessNetworkConnection.issueIdentity(namespace+'.participants.EventSpaceOwner#'+ESId,ESId)
            /* Import card for identity */
            await importCardForIdentity(ESId,identity)
            /* Disconnect */
            await businessNetworkConnection.disconnect('admin@wizticket')
            /* Success */
            return true
        } catch(err){
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    registerES : async function (ESId,name,description,city,country,region,street,postalcode,seating,owner) {
        try{
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect('admin@wizticket')
            /* Create the factory */
            factory = businessNetworkConnection.getBusinessNetwork().getFactory()
            /* Create the ES Asset */
            const ES = factory.newResource(namespace+'.events','EventSpace',ESId)
            ES.name = name
            ES.description = description
            ES.seating = seating
            ES.events = []
            const ESO = factory.newRelationship(namespace+'.participants','EventSpaceOwner',owner)
            ES.owner = ESO
            const address = factory.newConcept(namespace+'.utilities','Address')
            address.city = city
            address.country = country
            address.region = region
            address.street = street
            address.postalCode = postalcode
            ES.address = address
            const ESRegistry = await businessNetworkConnection.getAssetRegistry(namespace+'.events.EventSpace')
            await ESRegistry.add(ES)
            
            await businessNetworkConnection.disconnect('admin@wizticket')
            /* Success */
            return true
        } catch(err){
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    OwnerData: async function (ESId,cardId) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect(ESId)
            /* Get fan from the network */
            const fanRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.EventSpaceOwner')
            const fan = await fanRegistry.get(ESId)
            /* disconnect */
            await businessNetworkConnection.disconnect(cardId)

            return fan
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    /* Get Fan's Data 
    * @param {String} fanId fanId
    */

    FanData: async function (fanId,cardId) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect(cardId)
            /* Get fan from the network */
            const fanRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.Fan')
            const fan = await fanRegistry.get(fanId)
            /* disconnect */
            await businessNetworkConnection.disconnect(cardId)

            return fan
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    ArtistData: async function (artistId, cardId) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect(cardId)
            /* Get fan from the network */
            const artistRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.participants.Artist')
            const artist = await artistRegistry.get(artistId)
            /* disconnect */
            await businessNetworkConnection.disconnect(cardId)
            /* Return data */
            return artist
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    showAllEvents: async function(cardId) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect(cardId)
            /* Query all events */
            const eventRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+'.events.EventHappening')
            const allEvents = await eventRegistry.getAll()
            /* Disconnect */
            await businessNetworkConnection.disconnect(cardId)
            /* return results */
            return allEvents
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    },

    showAllEventSpaces: async function(cardId) {
        try {
            businessNetworkConnection = new BusinessNetworkConnection()
            await businessNetworkConnection.connect('admin@wizticket')
            /* Query all events */
            const eventRegistry = await businessNetworkConnection.getAssetRegistry(namespace+'.events.EventSpace')
            const allEvents = await eventRegistry.getAll()
            /* Disconnect */
            await businessNetworkConnection.disconnect('admin@wizticket')
            /* return results */
            return allEvents
        } catch(err) {
            console.log(err);
            var error = {};
            error.error = err.message
            return error;
        }
    }
    
}
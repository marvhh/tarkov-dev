import fetch  from 'cross-fetch';

const doFetchMaps = async (language) => {
    language = await new Promise(resolve => {
        if (!language) {
            return resolve('en');
        }
        return resolve(language);
    });
    const bodyQuery = JSON.stringify({
        query: `{
            maps(lang: ${language}) {
                id
                tarkovDataId
                name
                normalizedName
                wiki
                description
                enemies
                raidDuration
                players
                bosses {
                    name
                    normalizedName
                    spawnChance
                    spawnLocations {
                        name
                        chance
                    }
                    escorts {
                        name
                        normalizedName
                        amount {
                            count
                            chance
                        }
                    }
                    spawnTime
                    spawnTimeRandom
                    spawnTrigger
                }
            }
        }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const mapsData = await response.json();

    return mapsData.data.maps;
};

export default doFetchMaps;

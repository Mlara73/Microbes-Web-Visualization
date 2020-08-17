// Initialize Selected Bar Chart
function dropDwnGen(){
    d3.json("../data/samples.json").then((jsonData) => {
        // console.log(jsonData);
    
        const samplesArray = jsonData.names;
        // console.log(samplesArray);

        //html dropDown selector
        const dropDwnSelect = d3.select("#selDataset");

        samplesArray.forEach(sample =>{
            const option = dropDwnSelect.append("option");
            option.text(sample).property("value",sample);
        })
    });
};

function buildplot(sampleID){
    d3.json("../data/samples.json").then((jsonData) => {
        const samples = jsonData.samples;
        // console.log(samples);

        const filteredId = samples.filter(i =>
            i.id.toString() === sampleID
        )
        // console.log(filteredId);

        const sampleValues = filteredId[0].sample_values.slice(0,10).reverse();
        const otuValues = filteredId[0].otu_ids.slice(0,10).reverse();
        const genusValues = filteredId[0].otu_labels.slice(0,10).reverse();
        const genusArr = genusValues.map(genvalue =>
            genvalue.split(";").slice(-1)
        )
        // console.log(sampleValues);
        // console.log(otuValues);
        // console.log(genusValues);
        // console.log(genusArr);

        // create an array with "otuValues" and "genusArr"
        const otuGenus = [];
        
        otuValues.forEach((ov,i) => {
            const ovString = ov + " : " + genusArr[i]
            otuGenus.push(ovString)
        })
        // console.log(otuGenus);

        //bar plot with selection

        const trace = {
            x: sampleValues,
            y: otuGenus,
            type: "bar",
            orientation: "h",
            text: genusValues,
        }
        const data = [trace];

        layout = {
            title: "Top 10 Bacteria - Selected Subject",
            xaxis: {tickfont: {
                size: 12,
            }},
            yaxis: {tickfont: {
                size: 8,
            }},
            margin: {
                l: 100,
                r: 100,
                t: 30,
                b: 20
            }
        }

        Plotly.newPlot("bar2",data,layout);

        // All subjects Bar Plot
        const samplesUto = jsonData.samples;
        const otusObject = {};
        const genusObject = {};
        samplesUto.forEach(sample => {
            const otuIden = sample.otu_ids;
            console.log(otuIden);
            const sampleVal = sample.sample_values;
            const genus = sample.otu_labels;
            const genusVal = genus.map(genvalue => genvalue.split(";").slice(-1));

            otuIden.forEach((id,i) =>{
                if (id in otusObject){
                otusObject[id].push(sampleVal[i]);
                genusObject[id].push(genus[i]);
                }
                else{
                    otusObject[id] = [sampleVal[i]];
                    genusObject[id] = [genus[i]];
                }
            });
        });

        console.log(otusObject);
        console.log(genusObject);

        //reduce to aggregate sample_values by otu_id
        const aggOtuObject = {};
        Object.entries(otusObject).forEach(([key,value]) => {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            const aggOtuValues = value.reduce(reducer);
            if(key in aggOtuObject){
                aggOtuObject[key].push(aggOtuValues);
            }
            else{
                aggOtuObject[key] = aggOtuValues;
            }
        });
        console.log(aggOtuObject);

        //sort and slice aggOtuValues
        const aggOtuArr = Object.entries(aggOtuObject);
        const sortAggOtuArr = aggOtuArr.sort(function(a, b) {
            return b[1] - a[1];
        });
        const sliceAggOtuArr = sortAggOtuArr.slice(0,10);
        console.log(sliceAggOtuArr);

        console.log(Object.entries(genusObject));
        
        //adding Genus value within sliceAggOtuArr
        sliceAggOtuArr.forEach(agg => {
            Object.entries(genusObject).forEach(([key,value]) =>{
                if (agg[0] === key) {
                    agg.push(value[0]);
                    const genusValue = value[0].split(";").slice(-1);
                    agg.push(key + " : " + genusValue);
                }
            })
        });
        console.log(sliceAggOtuArr);

        //bar plot with selection

        const trace2 = {
            x: sliceAggOtuArr.map(agg => agg[1]).reverse(),
            y: sliceAggOtuArr.map(agg => agg[3]).reverse(),
            type: "bar",
            orientation: "h",
            text: sliceAggOtuArr.map(agg => agg[2]),
        }
        const data2 = [trace2];

        layout2 = {
            title: "Top 10 Bacteria - All Subjects",
            xaxis: {tickfont: {
                size: 12,
            }},
            yaxis: {tickfont: {
                size: 8,
            }},
            margin: {
                l: 100,
                r: 100,
                t: 30,
                b: 20
            }
        }

        Plotly.newPlot("bar1",data2,layout2);
    });    
};

function demographicInfo(sampleID){
    d3.json("../data/samples.json").then(res =>{
        const metadataObj = res.metadata;
        console.log(metadataObj);
        const filteredMetaObj = metadataObj.filter(metaObj =>
        metaObj.id.toString() === sampleID)
        const demographicInfo = filteredMetaObj[0]
        // console.log(demographicInfo);
        
        // wipe out "Demographic Info" dection every time the subject id is updated
        d3.select("#sample-metadata").text(" ");

        //html "Demographic Info" selector
        const demographicInfoRef = d3.select("#sample-metadata");

        Object.entries(demographicInfo).forEach(([key,value]) =>{
            const divElem = demographicInfoRef.append("div")
            divElem.text(`${key}:${value}`);
        })

    });

};

function optionChanged(sampleID){
    console.log(sampleID);
    buildplot(sampleID);
    demographicInfo(sampleID);
}

// init function to render a default chart

function init(){
    d3.json("../data/samples.json").then((jsonData) => {
        let initialID = jsonData.samples[0].id;
        console.log(initialID);
        buildplot(initialID);
        demographicInfo(initialID);   
    });
};

dropDwnGen();
init();


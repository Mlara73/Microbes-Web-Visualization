// Initialize Selected Bar Chart
function dropDwnGen(){
    d3.json("data/samples.json").then((jsonData) => {
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
    d3.json("data/samples.json").then((jsonData) => {
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

        const layout = {
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
        
        //Loop over all subjects/samples
        samplesUto.forEach(sample => {
            //otu_ids
            const otuIden = sample.otu_ids;
            // sample_values
            const sampleVal = sample.sample_values;
            //otu_labels and genus 
            const genus = sample.otu_labels;
            const genusVal = genus.map(genvalue => genvalue.split(";").slice(-1));

            //Loop over each otu_id
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
        console.log(aggOtuArr);
        const sortAggOtuArr = aggOtuArr.sort(function(a, b) {
            return b[1] - a[1];
        });
        const sliceAggOtuArr = sortAggOtuArr.slice(0,10);
        console.log(sliceAggOtuArr);

        console.log(Object.entries(genusObject));
        
        // adding Genus value within sliceAggOtuArr
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

        const layout2 = {
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

        //Bubble Chart
        //otu_labels for selected subject
        const otuLabel = filteredId[0].otu_labels;
        // grab the family
        const otuFam = otuLabel.map(label =>
            label.split(";").slice(0,5));
        const famSampValues = filteredId[0].sample_values;
        console.log(otuFam);
        console.log(sampleValues);

        const otuFamObject = {};
        // loop within otuFam/families to build an object where "family : sample_value"
        otuFam.forEach((fam,i) =>{
            // console.log(famSampValues[i]);
            if (fam in otuFamObject){
                otuFamObject[fam].push(famSampValues[i])
            }
            else{
                otuFamObject[fam] = [famSampValues[i]];
            }
        });
        console.log(otuFamObject);

        //reduce sample_value by family
        const aggFamObj = {};
        Object.entries(otuFamObject).forEach(([key,value]) => {
            const famReducer = (accum, currentVal) => accum + currentVal;
            const aggFamValues = value.reduce(famReducer);
            // console.log(aggFamValues);
            if (key in aggFamObj){
                aggFamObj[key].push(aggFamValues);
            }
            else{
                aggFamObj[key] = aggFamValues;
            }
        });
        console.log(aggFamObj);

        //sort aggFamObj
        const sortFamArr = Object.entries(aggFamObj).sort((a,b) =>
        {return b[1] - a[1]});
        console.log(sortFamArr);

        //create bubble chart
        const familyResult = sortFamArr.map(sortFam => sortFam[0]);
        const sampleValueResult = sortFamArr.map(sortFam => sortFam[1]);
        console.log(familyResult);

        const bubbleTrace = {
            x: sampleValueResult,
            y: familyResult,
            mode: 'markers',
            marker: {size: sampleValueResult,
            sizemode: 'area'},
        }

        const data3 = [bubbleTrace];

        const layout3 = {
            title: "Count of Bacteria - Selected Subject",
            xaxis: {tickfont: {
                size: 12,
            }},
            yaxis: {tickfont: {
                size: 8,
            }},
            margin: {
                l: 350,
                r: 200,
                t: 50,
                b: 50
            }
        }

        Plotly.newPlot("bubble",data3,layout3);
    });    
};

function demographicInfo(sampleID){
    d3.json("data/samples.json").then(res =>{
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
            const divElem = demographicInfoRef.append("h5")
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
    d3.json("data/samples.json").then((jsonData) => {
        let initialID = jsonData.samples[0].id;
        console.log(initialID);
        buildplot(initialID);
        demographicInfo(initialID);   
    });
};

dropDwnGen();
init();

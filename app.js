// Initialize Selected Bar Chart
function dropDwnGen(){
    d3.json("../data/samples.json").then((jsonData) => {
        console.log(jsonData);
    
        const samplesArray = jsonData.names;
        console.log(samplesArray);

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
        console.log(samples);

        const filteredId = samples.filter(i =>
            i.id.toString() === sampleID
        )
        console.log(filteredId);

        const sampleValues = filteredId[0].sample_values.slice(0,10).reverse();
        const otuValues = filteredId[0].otu_ids.slice(0,10).reverse();
        const genusValues = filteredId[0].otu_labels.slice(0,10).reverse();
        const genusArr = genusValues.map(genvalue =>
            genvalue.split(";").slice(-1)
        )
        console.log(sampleValues);
        console.log(otuValues);
        console.log(genusValues);
        console.log(genusArr);

        // create an object with "otuValues" and "genusArr"
        const otuGenus = [];
        
        otuValues.forEach((ov,i) => {
            const ovString = ov + " : " + genusArr[i]
            otuGenus.push(ovString)
        })
        console.log(otuGenus);

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

        //bar plot 
    });    
};

function optionChanged(sampleID){
    console.log(sampleID);
    buildplot(sampleID);
}

// init function to render a default chart

function init(){
    d3.json("../data/samples.json").then((jsonData) => {
        let initialID = jsonData.samples[0].id;
        console.log(initialID);
        buildplot(initialID);    
    });
};

dropDwnGen();
init();


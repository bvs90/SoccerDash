// initialise stats

var initialise = function(teamName){
  var today = new Date();
  today = today.toISOString('YYYY-MM-DD');
  today = today.slice(0,10);

  var teamHash = {
    "arsenal": 'Arsenal',
    "aston-villa": 'Aston Villa',
    "cardiff-city": 'Cardiff City',
    "chelsea": 'Chelsea',
    "crystal-palace": 'Crystal Palace',
    "everton": 'Everton', 
    "fulham": 'Fulham',
    "hull-city": 'Hull City',
    "liverpool": 'Liverpool', 
    "manchester-city": 'Manchester City', 
    "manchester-united": 'Manchester United', 
    "newcastle-united": 'Newcastle United',
    "norwich-city": 'Norwich City', 
    "southampton": 'Southampton', 
    "stoke-city": 'Stoke City', 
    "sunderland": 'Sunderland', 
    "swansea-city": 'Swansea City', 
    "tottenham-hotspur": 'Tottenham Hotspur', 
    "west-bromwich-albion": 'West Bromwich Albion', 
    "west-ham-united": 'West Ham United'
  }

  $('.full-team-name').text(teamHash[teamName]);

  getTopScorers(teamName);
  getForm(teamName);
  getFixtures(teamName, today);
  getResults(teamName, today);
  getTable(teamName);
}

// get top scorers 
var getTopScorers = function(teamName){
  if(('#top-scorers').length > 1) {
    $('#top-scorers').find('div').remove();
  };

  $.ajax({
    url: "http://api.statsfc.com/top-scorers.json?key=SBCwkOLa9b8lmePuTjFIoFmFkdo9cvtAPrhxlA6k&competition=premier-league&team=" + teamName + "&year=2013/2014",    
    dataType: "jsonp",
    success: function(data){
      var scoreObj = [];
      for(var i = 0; i < 9; i++){
        if(data[i]){
          scoreObj.push(data[i]);
        }
      }
      renderScorers(scoreObj);
    },
    error: function(err){
      throw err;
    } 
  })
};

// render top scorers 
var renderScorers = function(data) {
  var goalsData = data;
  var maxGoals = goalsData[0]['goals'];

  var colors = d3.scale.linear()
    .domain([-4, 0, 4]) 
    .range(['#0F2940', '#1D527F', '#2C7CBF', '#3594E5', '#3BA5FF']);

  var chart = d3.select('#top-scorers').selectAll('div')
    .data(goalsData)
    .enter().append('div').classed('data-container', true).classed('group', true)

  chart.append('span')
    .text(function(d) { return d.player + ": " + d.goals; });
  chart.append('div')
    .style('width', function(d) { return (96 / maxGoals) * d.goals + '%'})
    .style('background-color', function(d, i) { return colors(i); })
    .classed('data-rep', true)
}

// get & render league table
var getTable = function(teamName){
  if(('#league-table').length > 1) {
    $('#league-table').find('table').remove();
  };

  $.ajax({
    url: "http://api.statsfc.com/table.json?key=SBCwkOLa9b8lmePuTjFIoFmFkdo9cvtAPrhxlA6k&competition=premier-league&year=2013/2014",    
    dataType: "jsonp",
    success: function(data){
      var $table = $('<table></table>');
      var $headers = $('<tr><th>Team</th><th>Played</th><th>Won</th><th>Drawn</th><th>Lost</th><th>GF</th><th>GA</th><th>Diff</th><th>Points</th></tr>');
      $table.append($headers);
      $('#league-table').append($table);
      
      for(var i = 0; i < data.length; i++){
        if (teamName === data[i].teampath){
          var $row = $('<tr class="selected-team"></tr>');  
        }else{
          var $row = $('<tr></tr>');
        }
        var $team = $('<td class="team-name" data-team="' + data[i].teampath + '">' + data[i].team +'</td>');
        var $played = $('<td>' + data[i].played +'</td>');
        var $won = $('<td>' + data[i].won +'</td>');
        var $drawn = $('<td>' + data[i].drawn +'</td>');
        var $lost = $('<td>' + data[i].lost +'</td>');
        var $goalsFor = $('<td>' + data[i]['for'] +'</td>');
        var $goalsAgainst = $('<td>' + data[i].against +'</td>');
        var $goalDiff = $('<td>' + data[i].difference +'</td>');
        var $points = $('<td>' + data[i].points +'</td>');
        $row.append([$team, $played, $won, $drawn, $lost, $goalsFor, $goalsAgainst, $goalDiff, $points]);
        $table.append($row);
      }
       
    },
    error: function(err){
      throw err;
    } 
  })
};  

// get results
var getResults = function(teamName, today){
  if(('#results').length > 1) {
    $('#results').find('svg').remove();
  };

  $.ajax({
    url: "http://api.statsfc.com/results.json?key=SBCwkOLa9b8lmePuTjFIoFmFkdo9cvtAPrhxlA6k&competition=premier-league&team=" + teamName + "&year=2013/2014&from=2013-08-01&to=" + today + "&timezone=America/Los_Angeles&limit=10",    
    dataType: "jsonp",
    success: function(data){
      renderResults(teamName, data);
    },
    error: function(err){
      throw err;
    } 
  })
}; 

// render results
var renderResults = function(teamName, data) {
  resultsArr = [];
  
  var colors = d3.scale.linear()
    .domain([-4, 0, 4]) 
    .range(['#0F2940', '#1D527F', '#2C7CBF', '#3594E5', '#3BA5FF']);

  for(var i = 0; i < data.length; i++) {
    if(data[i].homepath === teamName) {
      var opponent = data[i].away;
      var venue = 'Home';
      var result = data[i].fulltime.join('-');     
    }else {
      var opponent = data[i].home;
      var venue = 'Away';
      var result = data[i].fulltime.reverse().join('-');
    }
    resultsArr.push({'result': result, 'opponent': opponent, 'value': 1}); 
  }
  
  var width = "100%";
  var height = "100%";
  var radius = 110;

  var canvas = d3.select('#results')
    .append('svg:svg')
    .data([resultsArr])
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("transform", "translate(" + 234 + " , " + 150 + ")");  

  var arc = d3.svg.arc()
    .outerRadius(radius);

  var pie = d3.layout.pie()
    .value(function(d) { return d.value; });

  var arcs = canvas.selectAll('g.slice')
    .data(pie)
    .enter()
      .append('svg:g')
        .attr("class", "slice");

    arcs.append("svg:path")
      .attr("fill", function(d, i) { return colors(i); })
      .attr("d", arc);    

    arcs.append("svg:text")
      .attr("transform", function(d) {
        d.innerRadius = 0;
        d.outerRadius = radius;
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function(d, i) { 
          return resultsArr[i].result;
      });

  var pos = d3.svg.arc().innerRadius(radius + 40).outerRadius(radius + 40); 

  arcs.append("svg:text") 
         .attr("transform", function(d) { return "translate(" + 
      pos.centroid(d) + ")"; }) 
         .attr("dy", 5) 
         .attr("text-anchor", "middle")   
         .text(function(d, i) { return resultsArr[i].opponent;});  
};

// get form 
var getForm = function(teamName){
  if(('#form').length > 1) {
    $('#form').find('svg').remove();
    $('#form').find('ul').remove();
  };
  $.ajax({
    url: "http://api.statsfc.com/form.json?key=SBCwkOLa9b8lmePuTjFIoFmFkdo9cvtAPrhxlA6k&competition=premier-league&year=2013/2014",    
    dataType: "jsonp",
    success: function(data){
      for(var i = 0; i < data.length; i++){
        if(teamName === data[i]['teampath']) {
          renderForm(data[i].form);
        }
      } 
    },
    error: function(err){
      throw err;
    } 
  })
};

// render form  
var renderForm = function(data) {
  formArr = [
    { 'label': 'Won', 'value': 0},
    { 'label': 'Lost', 'value': 0},
    { 'label': 'Drawn', 'value': 0}
  ];
  
  var width = "100%";
  var height = "100%";
  var radius = 125;
  var color = d3.scale.category20c();

  for(var i = 0; i < data.length; i++) {
    if(data[i] === 'W') {
      formArr[0]['value']++;
    }else if(data[i] === 'D') {
      formArr[2]['value']++;
    }else {
      formArr[1]['value']++;
    }
  }

  var canvas = d3.select('#form')
    .append('svg:svg')
    .data([formArr])
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("transform", "translate(" + 234 + " , " + radius + ")");  

  var arc = d3.svg.arc()
    .outerRadius(radius);

  var pie = d3.layout.pie()
    .value(function(d) { return d.value; });

  var arcs = canvas.selectAll('g.slice')
    .data(pie)
    .enter()
      .append('svg:g')
        .attr("class", "slice");

    arcs.append("svg:path")
      .attr("fill", function(d, i) { return color(i); })
      .attr("d", arc);    

    arcs.append("svg:text")
      .attr("transform", function(d) {
        d.innerRadius = 0;
        d.outerRadius = radius;
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function(d, i) { 
        if(d.value !== 0) { // don't show label if value is 0 
          return formArr[i].label + ": "  + formArr[i].value;  
        }
      });    
}

var formatDate = function(dateString) {
  var time = dateString.slice(11);
  var date = dateString.slice(0,10);
  var re = /(:00*)$/;
  var newTime = time.replace(re, ' AM');
  date = date + " " + newTime;
  return date;
}


// get & render fixtures 
var getFixtures = function(teamName, today){
  if(('#fixtures').length > 1) {
    $('#fixtures').find('ul').remove();
  };

  $.ajax({
    url: "http://api.statsfc.com/fixtures.json?key=SBCwkOLa9b8lmePuTjFIoFmFkdo9cvtAPrhxlA6k&competition=premier-league&team=" + teamName + "&from=" + today + "&to=2014-06-01&timezone=America/Los_Angeles&limit=10",    
    dataType: "jsonp",
    success: function(data){
      $list = $('<ul></ul>');
      for(var i = 0; i < data.length; i++){
        if(data[i].homepath === teamName) {
          var opponent = data[i].away;
          var venue = 'at Home';
        }else {
          var opponent = data[i].home;
          var venue = 'Away';
        }        
        $fixtures = $('<li>' + formatDate(data[i].date) + " Versus " + opponent + " " + venue + '</li>');
        $list.append([$fixtures]);
        $('#fixtures').append($list)
      } 
    },
    error: function(err){
      throw err;
    } 
  })
};

// on ready functions 
$(function() {
  $('#setup button').on('mouseenter', function(e) {
    e.preventDefault();
    $('#team-menu').fadeIn(600);
  });

  $('#team-menu a').on('click', function(e) {
    e.preventDefault();
    var team = $(this).data('team');
    $('#setup').remove();
    $('.stats-container').fadeIn(600);
    initialise(team);

  });

  $('#league-table').on('click', '.team-name', function() {
    initialise($(this).data('team'));
  });      

  $('.team-list-flyout').find('a').on('click', function() {
    initialise($(this).data('team'));
  })   
})


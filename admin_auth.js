<script>
	 $(document).ready(function  () {
	 	$("#submit").on("submit",function  (e) {
      e.preventDefault();
	 		console.log();
	 		$.post("/action_transfer",$(this).serialize(), function( data ) {
			  console.log(data);
			});
	 	})
	 });
</script>



<ul class="collapsible" data-collapsible="accordion">
  <li>
    <div class="collapsible-header">Transfer To</div>
    <div class="collapsible-body">
      <select id="airportip" disabled type="text" placeholder="Enter Airport Name" name="airport" required><br>
        <option value="" disabled selected>Choose your option</option>
        {{#each airport}}
          <option class="chk" value={{city}}>{{city}}</option>
        {{/each}}
      </select>
    </div>
  </li>
</ul>

/**
 * Created by root on 5/15/15.
 */

var exports = {};

var DEFAULT_PAGINATION_PAGE = 0;
var DEFAULT_PAGINATION_SIZE = 10;

// function receiveGetPageResponse
/*
    Given a GET request on a .json endpoint of form:

       'GET .../foo.json?page=X&size=N'

    This function will ensure the received response
    results can be dumped into the view table. The
    response will also have a valid META field available
    to calculate number of pagination ui elements.
 */
exports.receiveGetPageResponse = function(msg, requestedPage, requestedPageSize){
    //Specify defaults
    if(requestedPage === undefined)
        requestedPage = DEFAULT_PAGINATION_PAGE;
    if(requestedPageSize === undefined)
        requestedPageSize = DEFAULT_PAGINATION_SIZE;

    if(msg.meta && msg.meta.page == requestedPage && msg.meta.pageSize == requestedPageSize && msg.meta.totalQueryResultCount !== undefined)
    {
        //The message payload has a meta object, and the server respected our parameters
        //We assume this structure as a result:
        /*
            {
                pl : [X*N...X*N+N],             //object array, length = msg.meta.pageSize
                er : {...},                     //error object
                meta: {
                    page : X,                   //Which page of results this result set matches.
                    pageSize : N                //How many results there are per page
                    totalQueryResultCount : T   //Number of results matched by the query, ignoring pagination
                }
            }
         */
        return msg;
    }
    else if(!msg.meta)
    {
        //The message payload has no meta object, meaning server did not respect our request for pagination
        //We assume the server did a 'return all' and has this structure:
        /*
            {
                pl : [0...T],     //object array, length = (T)otal size
                er : {...},     //error object
            }
         */
        //We will therefore trim down the pl array, if we can, to just our requested page.

        var min_idx = requestedPage * requestedPageSize;
        var max_idx = (requestedPage+1) * requestedPageSize;

        msg.meta = {
            _inferred: true,
            page: requestedPage,
            pageSize: requestedPageSize
        }

        if(msg.pl)
        {
            msg.meta.totalQueryResultCount = msg.pl.length;
            if(msg.pl.length <= min_idx)
                msg.pl = msg.pl.slice(min_idx,max_idx);
        }
        else
        {
            msg.meta.totalQueryResultCount = 0;
        }
        return msg;
    }
    else
    {
        //The message payload has a meta object, but the server did not respect our pagination parameters
        //We assume the message is trash and throw an error
        throw new Error("INCONSISTENT PAGINATION PARAMETERS ON RESPONSE: Got ",msg.meta,", but was expecting {page:",requestedPage,", pageSize:",requestedPageSize,", totalQueryResultCount: < some number >}");
    }
}
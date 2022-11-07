from flask import Response, request
from flask_restful import Resource
from models import LikePost, db
import json
from tests import utils
from views import can_view_post
import flask_jwt_extended

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "like_post" based on the data posted in the body 

        try: 
            body = request.get_json()
            print(body)

            post_id=body.get('post_id')
            if can_view_post(post_id, self.current_user):
                post_like = LikePost(self.current_user.id, post_id)
                db.session.add(post_like)
                db.session.commit()
            else:
                return Response(json.dumps({"message": "Invalid like"}), mimetype="application/json", status=404)
            
        except Exception:
            return Response(json.dumps({"message": "Duplicated like"}), mimetype="application/json", status=400)

        return Response(json.dumps(post_like.to_dict()), mimetype="application/json", status=201)



class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "like_post" where "id"=id
        print(id)

        if (str(id).isnumeric()==False):
            return Response(json.dumps({"message": "post id={0} is invalid".format(id)}), mimetype="application/json", status=404)
        # does not print out the error message on the page
        
        post_like = LikePost.query.get(id)
        if not post_like:
            return Response(json.dumps({"message": "You cannot unlike a post that you did not like"}), mimetype="application/json", status=404)
        if self.current_user.id == post_like.user_id:
            LikePost.query.filter_by(id=id).delete()
            db.session.commit()
            return Response(json.dumps({"message": "Liked Post={0} was successfully unliked".format(id)}), mimetype="application/json", status=200)
        else: 
            return Response(json.dumps({"message": "Invalid u like"}), mimetype="application/json", status=404)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/likes', 
        '/api/posts/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/likes/<int:id>', 
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )